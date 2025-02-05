import { Button } from 'template-rewrite-framer/src/components/Button'
import { marked } from 'marked'
import { reload, withMode } from 'template-rewrite-framer/src/lib/utils'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    debounce,
    pluginApiClient,
    sleep,
} from '@/lib/utils'
import { useEffect, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
} from 'react-router'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { CanvasRootNode, framer, PublishInfo } from 'framer-plugin'
import {} from 'react-router'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import { Link } from 'react-router-dom'
import { ReactExportComponent } from 'db/prisma'
import { generateStackblitzProject } from 'website/src/lib/utils'
function markdown({ shortId }) {
    return `

To download and start using your React components, run the following command:

    npx unframer@latest ${shortId}

- This command will download the React components in a \`framer\` folder.

- Import them and use them with full **TypeScript** support.

- Framer variables and breakpoints will be available as **React props**.

- These files are **generated**, do not edit them manually. Instead run the command again after making changes in Framer.

- For more info or issues please visit <a href="https://github.com/remorses/unframer" target="_blank" rel="noopener noreferrer">unframer GitHub</a>.
`
}
async function loader({}: LoaderFunctionArgs) {
    const info = await framer.getProjectInfo()
    const [org, reactExportProject] = await Promise.all([
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),

        pluginApiClient.api.plugins.reactExportPlugin
            .project({ projectId: info?.id?.slice(0, 16) })
            .get({})
            .then(({ data, error }) => {
                if (error) {
                    return null
                }
                return data
            }),
    ])
    const { id: projectId, name: projectName } = info

    const { email, orgId } = org
    return {
        email,
        orgId,
        projectId,
        projectName,
        components: reactExportProject?.components || [],
    }
}

export function Readme(): RouteObject {
    return {
        path: Paths.readme,
        loader,
        Component,
    }
}

function useNotifier() {
    const { components, projectId } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

    const shortId = projectId.slice(0, 16)

    useEffect(() => {
        const componentIds = new Set(components.map((x) => x.id))
        const componentUrls = new Set(components.map((x) => x.url))

        const debounced = debounce(async (info: PublishInfo) => {
            const root = await framer.getCanvasRoot()
            // if (componentIds.has(root.id)) {
            //     // root.setPluginData('test', Math.random().toString(36).slice(2))
            //     await pluginApiClient.api.plugins.reactExportPlugin
            //         .project({ projectId: shortId })
            //         .publish.post({
            //             // projectId: shortId,
            //             components: [root as any],
            //         })
            //     return
            // }
            console.log(`detected change in canvas root`)
            const nodes = await root.getNodesWithType('ComponentNode')
            // console.log('nodes', nodes)
            const changed = nodes
                .filter((node) => {
                    return (
                        componentIds.has(node.id) &&
                        node.insertURL &&
                        // if insert url changed then it's updated
                        !componentUrls.has(node.insertURL)
                    )
                })
                .map((x) => {
                    const { id, insertURL, componentIdentifier, name } = x
                    const c: ReactExportComponent = {
                        id,
                        name: name || '',
                        url: insertURL!,
                        projectId: shortId,
                        componentIdentifier,
                    }
                    return c
                })
            if (!changed.length) {
                console.log('no changed components, ignoring')
                return
            }
            console.log('components changed', changed)
            // update componentUrls with new urls
            changed.forEach((c) => {
                // find and remove any existing url that matches before the @ symbol
                const baseUrl = c.url.split('@')[0]
                for (const existingUrl of componentUrls) {
                    if (existingUrl.split('@')[0] === baseUrl) {
                        componentUrls.delete(existingUrl)
                    }
                }
                componentUrls.add(c.url)
            })
            await pluginApiClient.api.plugins.reactExportPlugin
                .project({ projectId: shortId })
                .publish.post({
                    // projectId: shortId,
                    components: changed,
                })
        }, 300)
        const unsub = framer.subscribeToPublishInfo(debounced)
        return () => {
            unsub?.()
        }
    }, [])
}

function Component() {
    const [isLoading, setIsLoading] = useState(false)
    useRefreshOnVisible({ enabled: !isLoading })
    const { projectId, projectName } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const shortId = projectId.slice(0, 16)
    const markdownHtml = marked(markdown({ shortId }))
    // useNotifier()
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-3'>
            <div className='flex grow max-w-full'>
                <div
                    dangerouslySetInnerHTML={{ __html: markdownHtml }}
                    className={
                        'max-w-full tracking-normal leading-normal prose prose-sm text-sm dark:prose-invert prose-pre:px-3 prose-pre:text-[14px] prose-pre:text-framer-primary prose-pre:bg-framer-secondary prose-ul:list-disc '
                    }
                ></div>
            </div>
            {/* <hr className='' /> */}
            <div className='flex gap-3 grow'>
                <Button
                    variant='primary'
                    onClick={() => {
                        generateStackblitzProject({
                            projectId: shortId,
                            title: projectName,
                        })
                    }}
                    className=''
                >
                    Open Demo in Stackblitz
                </Button>

                {/* <Link className='grow' to={withMode(Paths.components)}>
                    <Button className=''>back</Button>
                </Link> */}
                {/* <a
                    className='grow'
                    target='_blank'
                    href='https://github.com/remorses/unframer'
                >
                    <Button className=''>Read More on GitHub</Button>
                </a> */}
            </div>
        </div>
    )
}
