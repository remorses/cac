import { create } from 'zustand'

interface PluginState {
    isConnected: boolean
    isExpanded: boolean
    websocketId: string
}

export const useStore = create<PluginState>((set) => ({
    isConnected: false,
    isExpanded: true,
    websocketId: '',
}))