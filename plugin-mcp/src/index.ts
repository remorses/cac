export {
    replaceEnumIdsForControls,
    getComponentPropertyControls,
    ControlType,
    getAttributeComments,
    getInstanceComponentId,
    isNodeZoomable,
    getFramerTree,
    discardFramerChanges,
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
    bfsFramerLayersTree as bfsOldTextTree,
    cleanupTreeFromEmptyNodes as cleanupOldTextTree,
} from './lib/tree-utils'

export {
    getInstancesWithOrderAndDepth,
    getComponentsWithBreakpoints,
    processReactExportData,
    type ReactExportComponentInstance,
} from './lib/react-export'

export type { FramerLayersTree } from './lib/types'

export { notifyError } from './lib/errors'
