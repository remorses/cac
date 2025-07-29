import { create } from 'zustand'

interface PluginState {
    isConnected: boolean
    isExpanded: boolean
    error?: string
}

export const useStore = create<PluginState>((set) => ({
    isConnected: false,
    isExpanded: false,
    error: undefined,
}))
