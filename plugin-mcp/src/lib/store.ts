import { create } from 'zustand'

interface PluginState {
    isConnected: boolean
    isSocketOpen: boolean
    isExpanded: boolean
    isUiHidden: boolean
    error?: string
}

export const useStore = create<PluginState>((set) => ({
    isConnected: false,
    isSocketOpen: false,
    isExpanded: true,
    isUiHidden: false,
    error: undefined,
}))
