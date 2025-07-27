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

    console.log('connecting over mcp websocketId', websocketId)
    const websocketUrl = `wss://unframer.co/_tunnel/client?id=${websocketId}`
    const ws = new WebSocket(websocketUrl)
    ws.onopen = () => {
        console.log('websocket client connected', websocketId)
        // TODO show connected only when upstreams connect. (listening for a 'ready' message)

        ws.send(JSON.stringify({ type: 'ready' }))
    }
    ws.onclose = () => {
        console.log('websocket client disconnected', websocketId)
        useStore.setState({ isConnected: false })
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
