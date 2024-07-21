import { supabase } from '@/lib/supabase-framer'
import { Paths, apiClient, withMode } from '@/lib/utils'
import { framer } from 'framer-plugin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { framerLoginUrl, loginRedirectUrl, sleep } from 'website/src/lib/utils'
import context from 'zustand/context'

function generateSecurePassword() {
    const length = 32 // Fixed length for high entropy
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'

    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => charset[x % charset.length])
        .join('')
}
export function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const isDocumentVisible = useIsDocumentVisibile()
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='opacity-70'>
                Login so we can keep your website data and progress
            </div>
            <button
                onClick={async () => {
                    if (isLoading) {
                        return
                    }
                    try {
                        const key = generateSecurePassword()

                        const url = framerLoginUrl({ key })
                        window.open(url, '_blank')

                        while (true) {
                            console.log('checking if login was completed')
                            const { data, error } =
                                await apiClient.api.v1.getSessionForKey.post({
                                    key,
                                })
                            if (error) {
                                throw error
                            }
                            if (data.session) {
                                console.log(
                                    'login was completed, got session',
                                    data,
                                )
                                // make it smaller
                                data.session.user = undefined as any
                                const { error } =
                                    await supabase.auth.setSession(data.session)
                                if (error) {
                                    throw error
                                }
                                navigate(
                                    withMode(Paths.doYouAlreadyHaveAWebsite),
                                )
                                break
                            } else {
                                await sleep(1000)
                            }
                        }
                    } catch (e) {
                        console.error('Failed to login', e)
                        framer.notify(String(e.message), {
                            variant: 'error',
                        })
                    } finally {
                        setIsLoading(false)
                    }
                }}
                className='framer-button-primary'
            >
                Login With Google
            </button>
        </div>
    )
}

function useIsDocumentVisibile() {
    const [isVisible, setIsVisible] = useState(
        document.visibilityState === 'visible',
    )

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === 'visible')
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            )
        }
    }, [])

    return isVisible
}
