/**
 * Helper functions for picking the active upstream plugin socket and matching
 * in-flight requests to the socket that sent them.
 */

import type { Attachment } from './tunnel.js'

type AttachmentSocket = {
    deserializeAttachment(): Attachment | undefined
    readyState?: number
}

type PendingSocketRequest = {
    upstreamConnectionId?: string
    upstreamConnectionOrdinal?: number
    upstreamConnectedAt?: number
}

const WS_OPEN = 1

export function getAttachmentConnectionId(attachment?: Attachment): string {
    return attachment?.connectionId || ''
}

export function getAttachmentConnectionOrdinal(attachment?: Attachment): number {
    return attachment?.connectionOrdinal || 0
}

export function getAttachmentConnectedAt(attachment?: Attachment): number {
    return attachment?.connectedAt || 0
}

export function isAttachmentReadyForRequests(attachment?: Attachment): boolean {
    return attachment?.readyAcked !== false
}

export function isSocketUsable(socket: AttachmentSocket): boolean {
    if (typeof socket.readyState === 'undefined') {
        return true
    }

    return socket.readyState === WS_OPEN
}

export function pickActiveUpstreamSocket<T extends AttachmentSocket>({
    sockets,
}: {
    sockets: T[]
}): T | undefined {
    return sockets
        .filter((socket) => {
            return isSocketUsable(socket)
        })
        .filter((socket) => {
            return isAttachmentReadyForRequests(socket.deserializeAttachment())
        })
        .sort((left, right) => {
            const rightOrdinal = getAttachmentConnectionOrdinal(
                right.deserializeAttachment(),
            )
            const leftOrdinal = getAttachmentConnectionOrdinal(
                left.deserializeAttachment(),
            )
            if (rightOrdinal !== leftOrdinal) {
                return rightOrdinal - leftOrdinal
            }
            return (
                getAttachmentConnectedAt(right.deserializeAttachment()) -
                getAttachmentConnectedAt(left.deserializeAttachment())
            )
        })[0]
}

export function matchesPendingRequestSocket({
    attachment,
    pendingRequest,
}: {
    attachment?: Attachment
    pendingRequest: PendingSocketRequest
}): boolean {
    const attachmentConnectionId = getAttachmentConnectionId(attachment)
    if (attachmentConnectionId && pendingRequest.upstreamConnectionId) {
        return attachmentConnectionId === pendingRequest.upstreamConnectionId
    }

    const attachmentConnectionOrdinal = getAttachmentConnectionOrdinal(attachment)
    if (attachmentConnectionOrdinal && pendingRequest.upstreamConnectionOrdinal) {
        return attachmentConnectionOrdinal === pendingRequest.upstreamConnectionOrdinal
    }

    const attachmentConnectedAt = getAttachmentConnectedAt(attachment)
    const pendingConnectedAt = pendingRequest.upstreamConnectedAt || 0

    return attachmentConnectedAt === pendingConnectedAt
}
