import {
    deployFly,
    getCurrentStage,
    getDopplerEnv,
    shell,
} from '@xmorse/deployment-utils'
import './openapi'

async function main() {
    const stage = getCurrentStage()
    console.log({ stage })
    const env = await getDopplerEnv({ stage, project: 'website' })
    env.FORCE_COLOR = '1'

    if (!process.env.SKIP_BUILD) {
        await Promise.all([
            shell(`pnpm --filter spiceflow build`, {
                env,
            }),
        ])

        await shell(`pnpm tsc --incremental`, {
            env,
        })

        await Promise.all([
            shell(`pnpm build`, {
                env: {
                    NODE_ENV: 'production',
                    ...env,
                },
            }),
        ])
    }
    const port = 8040
    const appName =
        stage === 'production'
            ? `unframer-website-prod`
            : `unframer-website-${stage}`
    await deployFly({
        appName,
        port,
        buildRemotely: true,
        buildkit: true,

        strategy: stage === 'production' ? 'bluegreen' : 'immediate',
        dockerfile: 'Dockerfile',
        forceHttps: false,

        // healthCheckPath: '/api/health',
        machineType: 'shared-cpu-2x',
        memorySize: stage === 'production' ? '1gb' : '512mb',
        maxInstances: stage === 'production' ? 3 : 1,
        minInstances: stage === 'production' ? 1 : 0,
        depot: true,

        env: {
            ...env,
            NODE_ENV: 'production',
            PORT: String(port),
        },
        regions: ['iad'],
    })
}

main()
