export enum McpToolNames {
    GetPublishedURL = 'getPublishedURL',
    FetchHTML = 'fetchHTML',
    GetSelectedNodeIds = 'getSelectedNodeIds',
    SetNodeAttributes = 'setNodeAttributes',
    ApplyColorStyle = 'applyColorStyle',
    InsertComponentInstance = 'insertComponentInstance',
    ExportReactComponents = 'exportReactComponents',
}

export type FramerLayersTree = Array<{
    content?: string
    nodeId?: string
    name?: string
    children?: FramerLayersTree
    attributes?: Record<string, string>
    attrControlsComments?: Record<string, string>
    count?: number
}>
