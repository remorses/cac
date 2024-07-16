import {
    shell,
    getDopplerEnv,
    getCurrentStage,
    deployFly,
} from '@xmorse/deployment-utils'
import path from 'path'

async function main() {
    // const stage = getCurrentStage()
    const env = await getDopplerEnv({ stage: 'production', project: 'website' })
    env.FORCE_COLOR = '1'
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
        dockerfile: 'Dockerfile',
        minInstances: 1,
        forceHttps: false,
        maxInstances: 2,
        healthCheckPath: '/api/health',
        memorySize: '512mb',

        env: {
            ...env,
            NODE_ENV: 'production',
            PORT: String(port),
        },
        regions: ['iad'],
    })
}

main()
