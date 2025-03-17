import { LoaderFunctionArgs, redirect, useLoaderData } from 'react-router';

export async function loader({}: LoaderFunctionArgs) {
    return {
        redirect: new Promise(async (resolve) => {
            await new Promise((r) => setTimeout(r, 2 * 1000))
            resolve(redirect('/home'))
        }),
    }
}

export default function Page() {
    const data = useLoaderData()

    return <div className=''>i should be redirected right now</div>
}
