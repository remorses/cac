// import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default ({
	test: {
		poolOptions: {
			workers: {
				// wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
});
