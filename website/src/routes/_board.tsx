import { Outlet } from '@remix-run/react'
import { PageContainer } from '../components/Container'

export default function Layout() {
    return (
        <PageContainer>
            <Outlet />
        </PageContainer>
    )
}
//
