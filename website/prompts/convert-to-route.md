convert this component to be a react-router route component:

before

```tsx
export function Settings() {
    const [isLoading, setIsLoading] = useState(false)
    const { session } = useRouteLoaderData(RouteIds.root) as PluginLoaderData
    const isDocumentVisible = useIsDocumentVisibile()
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex items-center'>
                <div className=''>
                    Currently logged in as{' '}
                    <span className='font-semibold inline'>
                        {session?.user?.email}
                    </span>
                </div>
                <div className='grow'></div>
                <Button
                    onClick={async () => {
                        // if (isLoading) {
                        //     return
                        // }
                        setIsLoading(true)
                        try {
                            const { error } = await supabase.auth.signOut()
                            if (error) {
                                throw error
                            }
                            window.location.pathname = '/'
                        } finally {
                            // setIsLoading(false)
                        }
                    }}
                    className='w-auto'
                    isLoading={isLoading}
                >
                    Sign Out
                </Button>
            </div>
            <div className='flex items-center'>
                <div className=''>
                    <span className='font-semibold inline'>{100}</span> credits
                    available
                </div>
                <div className='grow'></div>
                <a target='_blank' href={buyMoreCreditsUrl}>
                    <Button className='w-auto'>Buy More Credits</Button>
                </a>
            </div>

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
```

after

```tsx
import {} from 'react-router'
export function Settings() {
    return <Route />
    const [isLoading, setIsLoading] = useState(false)
    const { session } = useRouteLoaderData(RouteIds.root) as PluginLoaderData
    const isDocumentVisible = useIsDocumentVisibile()
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex items-center'>
                <div className=''>
                    Currently logged in as{' '}
                    <span className='font-semibold inline'>
                        {session?.user?.email}
                    </span>
                </div>
                <div className='grow'></div>
                <Button
                    onClick={async () => {
                        // if (isLoading) {
                        //     return
                        // }
                        setIsLoading(true)
                        try {
                            const { error } = await supabase.auth.signOut()
                            if (error) {
                                throw error
                            }
                            window.location.pathname = '/'
                        } finally {
                            // setIsLoading(false)
                        }
                    }}
                    className='w-auto'
                    isLoading={isLoading}
                >
                    Sign Out
                </Button>
            </div>
            <div className='flex items-center'>
                <div className=''>
                    <span className='font-semibold inline'>{100}</span> credits
                    available
                </div>
                <div className='grow'></div>
                <a target='_blank' href={buyMoreCreditsUrl}>
                    <Button className='w-auto'>Buy More Credits</Button>
                </a>
            </div>

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
```
