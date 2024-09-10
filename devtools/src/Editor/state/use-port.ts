import { useEffect, useState } from "react"
import { DevToolsInitMessage } from "../../types"
import { useEditAnimation } from "./use-edit-animation"
import { useIncomingMessages } from "./use-incoming-messages"
import { useIsRecording } from "./use-is-recording"

export function usePort() {
  const [port, setPort] = useState<chrome.runtime.Port | undefined>(undefined)

 

  useIncomingMessages(port)
  useIsRecording(port)
  useEditAnimation(port)

  return port
}
