export {
    replaceEnumIdsForControls,
    getComponentPropertyControls,
    ControlType,
    getAttributeComments,
    getInstanceComponentId,
    isNodeZoomable,
    getFramerTree,
    discardFramerChanges,
    inlineTextStyleAttributes,
    serializeAttributesForXml,
    applyAttributes,
} from './lib/framer'

export {
    rewriteXmlContentForTests,
    extractObjectsFromXmlContent,
    xmlToOldTextTree,
    oldTextTreeToXml,
    addNodeCount,
    type NewExtractedNode,
} from './lib/xml'



export {
    bfsOldTextTree,
    cleanupOldTextTree,
} from './lib/tree-utils'

export {
    getInstancesWithOrderAndDepth,
    getComponentsWithBreakpoints,
    processReactExportData,
    type ReactExportComponentInstance,
} from './lib/react-export'

export type { FramerLayersTree } from './types'

export { notifyError } from './lib/errors'
