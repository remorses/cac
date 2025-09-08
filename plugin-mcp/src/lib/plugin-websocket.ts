import { WebsocketMessage } from './mcp-websocket.js'
import { useStore } from './store.js'
import { McpToolWebsocketPayload } from './schema.js'

// Global variable to track the active cleanup function
let cleanupFunction: (() => void) | null = null

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

    // Check if we're already connected
    if (cleanupFunction) {
        console.log('Already connected, returning existing cleanup function')
        return cleanupFunction
    }

    const websocketUrl = `wss://unframer.co/_tunnel/upstream?id=${websocketId}`

    let ws: WebSocket
    let pingInterval: NodeJS.Timeout | null = null
    let reconnectInterval = 3000
    let shouldReconnect = true

    function connect() {
        console.log('connecting over mcp websocketId', websocketId)
        ws = new WebSocket(websocketUrl)

        ws.onopen = () => {
            console.log('websocket client connected', websocketId)
            reconnectInterval = 3000
            ws.send(JSON.stringify({ type: 'ready' }))
            useStore.setState({ error: undefined })

            // Setup ping interval
            if (pingInterval) clearInterval(pingInterval)
            pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }))
                }
            }, 5 * 1000)
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
                console.log('received ready')
                ws.send(JSON.stringify({ type: 'ready' }))
                useStore.setState({ isConnected: true, error: undefined })
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

                if (ws.readyState === WebSocket.OPEN) {
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
                }
            } catch (e) {
                console.error(`websocket error`, e)
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(
                        JSON.stringify({
                            id,
                            error: e instanceof Error ? e.message : String(e),
                        } satisfies WebsocketMessage),
                    )
                }
            }
        }

        ws.onerror = (error) => {
            console.error('websocket error', error)
        }

        ws.onclose = (event) => {
            console.log(
                `websocket client disconnected (${event.code}), reconnecting in ${reconnectInterval}ms`,
            )
            useStore.setState({ isConnected: false, error: undefined })
            if (pingInterval) {
                clearInterval(pingInterval)
                pingInterval = null
            }

            if (shouldReconnect) {
                setTimeout(connect, reconnectInterval)
                // exponential backoff (max 30s)
                reconnectInterval = Math.min(30000, reconnectInterval * 1.5)
            }
            cleanupFunction = null

            if (event.code === 4009) {
                const errorMessage =
                    'Another MCP plugin is already connected. Please close the other plugin and keep only one plugin open.'
                console.error(
                    'Another plugin is already connected for this user',
                )
                useStore.setState({
                    isConnected: false,
                    error: errorMessage,
                })

                return
            }
        }
    }

    // Start the connection
    connect()

    // Create and store the cleanup function
    cleanupFunction = () => {
        shouldReconnect = false
        if (pingInterval) clearInterval(pingInterval)
        if (!ws?.CLOSED) ws.close()
        cleanupFunction = null
    }

    // Return the cleanup function
    return cleanupFunction
}
