import { Outlet } from 'react-router';
import { PageContainer } from '../components/Container'

export default function Layout() {
    return (
        <PageContainer>
            <Outlet />
        </PageContainer>
    )
}

//
