import { beforeEach, afterEach, describe, it, expect, vi, test } from 'vitest'
import { generateUnframerRepo } from './unframer-github-repos'

test('create example repo', async () => {
    const projectId = 'cf755ed7d59e0319'
    const res = await generateUnframerRepo({
        projectId,
        title: 'example test repo',
        repo: 'example-test-repo',
        secret: 'x',
        // description: 'example test repo description',
    })
    console.log(res)
})
