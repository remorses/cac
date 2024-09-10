import { useEffect, useRef } from "react"
import { AnimationMetadata, MotionMessage } from "../../types"
import { getSelectedAnimation, getSelectedAnimationName } from "./selectors"
import { useEditorState } from "./use-editor-state"

export function useEditAnimation(port?: chrome.runtime.Port) {
  const selectedAnimationName = useEditorState(getSelectedAnimationName)
  const selectedAnimation = useEditorState(getSelectedAnimation)

  const time = selectedAnimation?.currentTime

  const prevSelectedAnimation = useRef<AnimationMetadata | undefined>()
  
}
