

import { create } from 'zustand'
import { Effect, EffectGroup } from './effects'

interface AppState {
  currentTime: number
  isPlaying: boolean
  effects: (Effect<any> | EffectGroup)[]
  setCurrentTime: (time: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setEffects: (effects: (Effect<any> | EffectGroup)[]) => void
}

export const useAppStore = create<AppState>((set) => {
  return {
    currentTime: 0,
    isPlaying: false,
    effects: [],
    setCurrentTime: (time) => set({ currentTime: time }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setEffects: (effects) => set({ effects }),
  }
})

