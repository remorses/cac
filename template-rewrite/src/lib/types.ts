import { Static, Type } from '@sinclair/typebox'

export const OldText = Type.Object({
    text: Type.String(),
    id: Type.Number(),
})

export const ReplaceTextInput = Type.Object({
    description: Type.String(),
    oldText: Type.Array(OldText),
})

export type OldText = Static<typeof OldText>

export type ReplaceTextInput = Static<typeof ReplaceTextInput>

export const OldImage = Type.Object({
    url: Type.String(),
    id: Type.Number(),
})
export type OldImage = Static<typeof OldImage>
