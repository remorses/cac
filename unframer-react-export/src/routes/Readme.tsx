import { Button } from 'template-rewrite-framer/src/components/Button'
import { marked } from 'marked'
import { reload, withMode } from 'template-rewrite-framer/src/lib/utils'

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
import { Link } from 'react-router-dom'
function markdown({ shortId }) {
    return `
### Your Components are Ready

To download and start using your React components, run the following command:

    npx unframer@latest ${shortId}

- This command will download the React components in a \`framer\` folder.
- Import them and use them with full **TypeScript** support.
- Framer variables will be available as **React props**. Breakpoints too.

- These files are **generated**, do not edit them manually. Instead run the command again after changes in Framer.
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
        <div className='flex flex-col justify-start gap-3'>
            <div className='flex grow max-w-full'>
                <div
                    dangerouslySetInnerHTML={{ __html: markdownHtml }}
                    className={
                        'max-w-full tracking-normal leading-normal prose prose-sm text-sm dark:prose-invert prose-pre:text-sm prose-pre:text-framer-primary prose-pre:bg-framer-secondary prose-ul:list-disc '
                    }
                ></div>
            </div>
            {/* <hr className='' /> */}
            <div className='flex gap-3 grow'>
                <Link className='grow' to={withMode(Paths.settings)}>
                    <Button className=''>Settings</Button>
                </Link>
                <a
                    className='grow'
                    target='_blank'
                    href='https://github.com/remorses/unframer'
                >
                    <Button className=''>Read More on GitHub</Button>
                </a>
            </div>
        </div>
    )
}
