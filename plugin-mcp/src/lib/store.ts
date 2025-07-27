import { create } from 'zustand'
import { framer } from 'framer-plugin'

interface PluginState {
    isConnected: boolean
    isExpanded: boolean
    websocketId: string
}

const PLUGIN_DATA_KEY = 'mcp-websocket-id'

// Initialize websocketId from plugin data or generate new one
const stored = await framer.getPluginData(PLUGIN_DATA_KEY)
const websocketId = stored || Math.random().toString(36).substring(2, 18)

if (!stored) {
    await framer.setPluginData(PLUGIN_DATA_KEY, websocketId)
}

export const useStore = create<PluginState>((set) => ({
    isConnected: false,
    isExpanded: true,
    websocketId,
}))