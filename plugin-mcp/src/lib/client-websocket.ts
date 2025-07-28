import { WebsocketMessage } from './websocket-server'
import { useStore } from './store'
import { McpToolWebsocketPayload } from './mcp-tools'

// Function for handling websocket connection based on session cookie
export async function websocketClientHandling({
    handle,
    websocketId,
}: {
    websocketId: string
    handle: <T extends McpToolWebsocketPayload>(
        payload: T,
    ) => Promise<T['output']>
}) {
    if (typeof window === 'undefined') return

    const websocketUrl = `wss://unframer.co/_tunnel/client?id=${websocketId}`
    
    let ws: WebSocket | null = null
    let pingInterval: NodeJS.Timeout | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    let isCleaningUp = false
    const maxReconnectAttempts = 10
    const baseReconnectDelay = 1000
    const maxReconnectDelay = 30000

    const clearTimers = () => {
        if (pingInterval) {
            clearInterval(pingInterval)
            pingInterval = null
        }
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout)
            reconnectTimeout = null
        }
    }

    const calculateReconnectDelay = () => {
        const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttempts),
            maxReconnectDelay
        )
        return delay + Math.random() * 1000
    }

    const setupWebSocket = () => {
        if (isCleaningUp) return

        console.log('connecting over mcp websocketId', websocketId)
        ws = new WebSocket(websocketUrl)
        
        ws.onopen = () => {
            console.log('websocket client connected', websocketId)
            reconnectAttempts = 0
            ws!.send(JSON.stringify({ type: 'ready' }))
            
            // Setup ping interval
            clearTimers()
            pingInterval = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }))
                }
            }, 1000)
        }
        
        ws.onclose = (event) => {
            console.log('websocket client disconnected', websocketId, event.code, event.reason)
            useStore.setState({ isConnected: false })
            clearTimers()
            
            if (!isCleaningUp && reconnectAttempts < maxReconnectAttempts) {
                const delay = calculateReconnectDelay()
                console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
                
                reconnectTimeout = setTimeout(() => {
                    reconnectAttempts++
                    setupWebSocket()
                }, delay)
            }
        }
        
        ws.onerror = (error) => {
            console.error('websocket error', error)
        }
        
        ws.onmessage = async (event) => {
        let data: WebsocketMessage
        try {
            data = JSON.parse(event.data)
        } catch {
            console.error(`websocket sent invalid json`, event.data)
            return
        }
        const { id, payload } = data || {}
        if (!payload?.type) {
            console.error(`websocket sent invalid data`, event.data)
            return
        }
        if (payload.type === 'ready') {
            ws.send(JSON.stringify({ type: 'ready' }))
            useStore.setState({ isConnected: true })
            return
        }
        if (payload.type === 'close') {
            useStore.setState({ isConnected: false })
            return
        }
        console.log(`websocket message received`, payload)

        try {
            const output = await handle(payload as any)
            console.log(`websocket message handled`, payload.type, output)

            ws.send(
                JSON.stringify({
                    id,
                    payload: {
                        input: payload.input! as any,
                        type: payload.type!,
                        output,
                    },
                } satisfies WebsocketMessage),
            )
        } catch (e) {
            console.error(`websocket error`, e)
            ws.send(
                JSON.stringify({
                    id,
                    error: e instanceof Error ? e.message : String(e),
                } satisfies WebsocketMessage),
            )
        }
    }
    // ping interval
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
        }
    }, 1000)

    // Return a cleanup function to close connection
    return () => {
        clearInterval(pingInterval)
        ws.close()
    }
}
