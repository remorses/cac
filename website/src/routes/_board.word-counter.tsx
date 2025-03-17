import { Button, Input } from '@nextui-org/react'
import posthtml from 'posthtml'

import { ActionFunctionArgs } from 'react-router'
import { Form, data as json, useActionData, useNavigation } from 'react-router'

export default function Page({}) {
    // const { credits } = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()
    return (
        <>
            <div className='w-full gap-[60px] flex flex-col items-center'>
                <div className='text-2xl'>Get the word count of a website</div>
                <Form
                    className='flex flex-col min-w-[400px] gap-4'
                    method='POST'
                >
                    <Input
                        type='url'
                        name='url'
                        label='Website URL'
                        // isRequired
                        required
                        labelPlacement='outside'
                        placeholder='https://example.com'
                    />
                    <Button
                        isLoading={navigation.state !== 'idle'}
                        type='submit'
                    >
                        Get word count
                    </Button>
                </Form>
                {actionData?.wordCount && (
                    <div className='flex flex-col items-center gap-4 text-center'>
                        <div className='text-2xl max-w-[300px] text-center'>
                            This website page contains about{' '}
                            {actionData.wordCount} words
                        </div>
                        <div className='opacity-70'>
                            Notice that this is an estimate, the actual word
                            count may be different
                        </div>
                    </div>
                )}
                {actionData?.error && (
                    <div className='text-red-300 text-center'>
                        {actionData.error}
                    </div>
                )}
            </div>
        </>
    )
}

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData()
    const url = data.get('url')?.toString()
    if (!url) {
        return json({ error: 'No url provided', wordCount: 0 }, { status: 400 })
    }
    const res = await fetch(url)

    // console.log(html)
    let wordCount = 0
    const { HTMLRewriter } = await import('htmlrewriter')
    const rewriter = new HTMLRewriter()

    await rewriter
        .on('*', {
            text(text) {
                console.log('text', text.text)
                wordCount += text.text.length
            },
        })
        .transform(res)
        .text()

    return { wordCount, error: null }
}
