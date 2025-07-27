// Temporary type definitions until we can fix circular dependencies

export type FramerLayersTree = Array<{
    content?: string
    nodeId?: string
    name?: string
    children?: FramerLayersTree
    attributes?: Record<string, string>
    attrControlsComments?: Record<string, string>
    count?: number
}>