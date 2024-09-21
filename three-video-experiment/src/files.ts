import mime from 'mime'
import * as indexDb from 'idb-keyval'

async function requestPersistentAccess(fileHandle: FileSystemFileHandle) {
    if ((await fileHandle.queryPermission({ mode: 'read' })) !== 'granted') {
        if (
            (await fileHandle.requestPermission({ mode: 'read' })) !== 'granted'
        ) {
            console.log('Permission not granted')
            return false
        }
    }
    return true
}

export async function getFileForMediaHandle(mediaHandle: FileSystemFileHandle) {
    const extension = mediaHandle.name.split('.').pop()?.toLowerCase()
    let type = mime.getType(extension || '') || 'application/octet-stream'
    const file = await mediaHandle.getFile()
    if (!file) {
        throw new Error('No file found')
    }
    if (!file.type) {
        const media = new File([file], mediaHandle.name, {
            type,
        })
        return media
    }
    return file
}

export async function getMediaHandleId(mediaHandle: FileSystemFileHandle) {
    // Generate a consistent ID for the media handle based on its name
    const fileObject = await mediaHandle.getFile()
    let fileSize = fileObject.size
    const tempName = mediaHandle.name.replace(/\s+/g, '-')
    return `media-${fileSize}-${tempName}`
}

export async function pickMediaHandle() {
    try {
        const [mediaHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: 'Videos',
                    accept: {
                        'video/*': ['.mp4', '.webm', '.ogg', '.mov'],
                        'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
                    },
                },
            ],
            // startIn: 'videos',
        })
        let id = await getMediaHandleId(mediaHandle)
        console.log('loaded media with id', id)

        await indexDb.set(id, mediaHandle)
        return mediaHandle
    } catch (error) {
        console.error('Error selecting file:', error)
        throw error
    }
}

export async function getHandleForMediaId(mediaHandleId?: string) {
    if (mediaHandleId) {
        const mediaHandle: FileSystemFileHandle = (await indexDb.get(
            mediaHandleId,
        )) as any
        if (mediaHandle) {
            await requestPersistentAccess(mediaHandle)
            return mediaHandle
        }
    }
}
