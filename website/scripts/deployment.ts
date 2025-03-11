import { deployFly, getDopplerEnv, shell } from '@xmorse/deployment-utils'
import './openapi'

async function main() {
    // const stage = getCurrentStage()
    const env = await getDopplerEnv({ stage: 'production', project: 'website' })
    env.FORCE_COLOR = '1'
    await Promise.all([
        shell(`pnpm --filter spiceflow build`, {
            env,
        }),

        // shell(`pnpm --filter unframer build`, {
        //     env,
        // }),
    ])

    await shell(`pnpm tsc --incremental`, {
        env,
    })

    await Promise.all([
        // shell(`pnpm --filter template-rewrite-framer build`, {
        //     env,
        // }),
        // shell(`pnpm --filter github-framer build`, {
        //     env,
        // }),
        // shell(`pnpm --filter angled-screen build`, {
        //     env,
        // }),
    ])
    await Promise.all([
        shell(`pnpm build`, {
            env,
        }),
    ])

    const port = 8040
    await deployFly({
        appName: 'unframer-website-prod',
        port,
        buildRemotely: true,
        // strategy: 'rolling',
        dockerfile: 'Dockerfile',
        minInstances: 1,
        forceHttps: false,
        maxInstances: 3,
        healthCheckPath: '/api/health',
        memorySize: '1gb',
        machineType: 'shared-cpu-2x',
        depot: true,
        // statics: [
        //     {
        //         guest_path: '/app/build/client',
        //         url_prefix: '/',
        //         index_document: 'index.html',
        //     },
        // ],
        env: {
            ...env,
            NODE_ENV: 'production',
            PORT: String(port),
        },
        regions: ['iad'],
    })
}

main()
