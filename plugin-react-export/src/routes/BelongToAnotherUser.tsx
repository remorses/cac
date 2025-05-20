import {
    Paths,
    PluginDataKeys,
    withMode
} from '@/lib/utils'
import { Button } from 'plugin-migrate/src/components/Button'
import {
    Form,
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useSearchParams
} from 'react-router'

import { framer } from 'framer-plugin'

async function action({}: LoaderFunctionArgs) {
    await framer.setPluginData(PluginDataKeys.sessionKey, null)
    throw redirect(withMode(Paths.login))
}

export function BelongToAnotherUser(): RouteObject {
    return {
        path: Paths.belongToAnotherUser,
        action,
        Component,
    }
}

const errorIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='text-red-500'
    >
        <circle cx='12' cy='12' r='10' />
        <line x1='12' y1='8' x2='12' y2='12' />
        <line x1='12' y1='16' x2='12.01' y2='16' />
    </svg>
)

function Component() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get('email') || ''
    return (
        <Form
            method='POST'
            className='flex flex-col justify-start gap-3 text-center items-center'
        >
            <div className='flex flex-col max-w-[280px] gap-3 items-center my-4'>
                <div className='flex grow w-full flex-col gap-3 items-center'>
                    {errorIcon}
                    <div className=' text-sm text-balance'>
                        This Framer project belongs to another user
                    </div>
                    <div className=' opacity-70 text-balance'>
                        Login again with {email}. After login all users will be able to access the project.
                    </div>
                </div>
            </div>
            {/* <hr className='' /> */}

            <div className='flex gap-3 items-center'>
                {/* <Button
                    variant='normal'
                    onClick={() => navigate(-1)}
                    className='grow w-auto'
                >
                    Go Back
                </Button> */}

                <Button
                    variant='primary'
                    type='submit'
                    className='font-semibold grow w-auto '
                >
                    Login with {email}
                </Button>
            </div>
        </Form>
    )
}
