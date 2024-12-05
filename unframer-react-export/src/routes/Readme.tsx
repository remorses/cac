import { Button } from 'template-rewrite-framer/src/components/Button'
import { marked } from 'marked'
import { reload } from 'template-rewrite-framer/src/lib/utils'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    pluginApiClient,
} from '@/lib/utils'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
} from 'react-router'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { framer } from 'framer-plugin'
import {} from 'react-router'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
function markdown({ shortId }) {
    return `
## Welcome to React Export

This is a template for exporting React components to Framer.


Run this command to download the Framer components as React components:

    npx unframer ${shortId}

- This command will put your React components in the \`framer\` folder.

- These files will also have a .d.ts to add type safety and autocomplete to your React components.
`
}
async function loader({}: LoaderFunctionArgs) {
    const [org, info] = await Promise.all([
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        framer.getProjectInfo(),
    ])
    const { id: projectId, name: projectName } = info

    const { email, orgId } = org
    return { email, orgId, projectId, projectName }
}

export function Readme(): RouteObject {
    return {
        path: Paths.readme,
        loader,
        Component,
    }
}

function Component() {
    const [isLoading, setIsLoading] = useState(false)
    useRefreshOnVisible({ enabled: !isLoading })
    const { projectId, projectName } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const shortId = projectId.slice(0, 16)
    const markdownHtml = marked(markdown({ shortId }))
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex grow max-w-full'>
                <div
                    dangerouslySetInnerHTML={{ __html: markdownHtml }}
                    className={
                        'max-w-full prose prose-sm text-sm dark:prose-invert prose-pre:text-sm prose-pre:text-framer-primary prose-pre:bg-framer-secondary prose-ul:list-disc '
                    }
                ></div>
            </div>
            {/* <hr className='' /> */}

            <Button
                onClick={() => {
                    navigate(-1)
                }}
                className=''
            >
                Go Back
            </Button>
        </div>
    )
}
