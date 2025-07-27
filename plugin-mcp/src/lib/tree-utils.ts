import { FramerLayersTree } from '../types'

export function bfsOldTextTree(tree: FramerLayersTree) {
    const result: FramerLayersTree[number][] = []
    const queue = [...tree]
    
    while (queue.length > 0) {
        const node = queue.shift()
        if (!node) continue
        
        result.push(node)
        
        if (node.children) {
            queue.push(...node.children)
        }
    }
    
    return result
}

export function cleanupOldTextTree(tree: FramerLayersTree): FramerLayersTree {
    function cleanNode(node: FramerLayersTree[number]): FramerLayersTree[number] | null {
        // Skip nodes without content and without children
        if (!node.content && (!node.children || node.children.length === 0)) {
            return null
        }
        
        const cleanedNode: FramerLayersTree[number] = {
            ...node
        }
        
        if (node.children) {
            const cleanedChildren = node.children
                .map(cleanNode)
                .filter((n): n is FramerLayersTree[number] => n !== null)
            
            if (cleanedChildren.length > 0) {
                cleanedNode.children = cleanedChildren
            } else {
                delete cleanedNode.children
            }
        }
        
        return cleanedNode
    }
    
    return tree
        .map(cleanNode)
        .filter((n): n is FramerLayersTree[number] => n !== null)
}