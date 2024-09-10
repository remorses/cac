import { useEffect } from 'react'
import { IsRecordingMessage } from '../../types'
import { EditorState } from './types'
import { useEditorState } from './use-editor-state'

const getIsRecording = (state: EditorState) => state.isRecording

export function useIsRecording() {
    const isRecording = useEditorState(getIsRecording)
    return isRecording
}
