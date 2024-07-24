// vite.config.mts
import { vitePlugin as remix } from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/@remix-run+dev@2.10.3_@remix-run+react@2.10.3_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_sk23m7xsr3edwmmbvxpk3b4qhm/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/vite@5.3.4_@types+node@20.14.10/node_modules/vite/dist/node/index.js";
import Inspect from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/vite-plugin-inspect@0.8.4_rollup@4.19.0_vite@5.3.4_@types+node@20.14.10_/node_modules/vite-plugin-inspect/dist/index.mjs";
import tsconfigPaths from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.4_vite@5.3.4_@types+node@20.14.10_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import EnvironmentPlugin from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/vite-plugin-environment@1.1.3_vite@5.3.4_@types+node@20.14.10_/node_modules/vite-plugin-environment/dist/index.js";
import { visualizer } from "file:///Users/morse/Documents/GitHub/unframer-private/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.19.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var building = process.env.NODE_ENV === "production";
var vite_config_default = defineConfig({
  clearScreen: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  },
  plugins: [
    EnvironmentPlugin("all", { prefix: "PUBLIC" }),
    Inspect(),
    remix({
      appDirectory: "src",
      serverModuleFormat: "cjs",
      future: {
        v3_fetcherPersist: true,
        unstable_singleFetch: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths(),
    {
      apply(config, env) {
        if (env.isSsrBuild) {
          return true;
        }
        return false;
      },
      ...visualizer({ filename: "build/trace.html" })
    }
    // bundleGraphPlugin(),
  ],
  ssr: {
    noExternal: building || void 0,
    external: building ? ["@prisma/client", "@sentry/node", "htmlrewriter"] : void 0
  },
  optimizeDeps: {
    // include: ['@sentry/node'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  legacy: {
    proxySsrExternalModules: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21vcnNlL0RvY3VtZW50cy9HaXRIdWIvdW5mcmFtZXItcHJpdmF0ZS93ZWJzaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbW9yc2UvRG9jdW1lbnRzL0dpdEh1Yi91bmZyYW1lci1wcml2YXRlL3dlYnNpdGUvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tb3JzZS9Eb2N1bWVudHMvR2l0SHViL3VuZnJhbWVyLXByaXZhdGUvd2Vic2l0ZS92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgSW5zcGVjdCBmcm9tICd2aXRlLXBsdWdpbi1pbnNwZWN0J1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcbmltcG9ydCBFbnZpcm9ubWVudFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1lbnZpcm9ubWVudCdcblxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcblxuY29uc3QgYnVpbGRpbmcgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICAgIGRlZmluZToge1xuICAgICAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViksXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIEVudmlyb25tZW50UGx1Z2luKCdhbGwnLCB7IHByZWZpeDogJ1BVQkxJQycgfSksXG4gICAgICAgIEluc3BlY3QoKSxcbiAgICAgICAgcmVtaXgoe1xuICAgICAgICAgICAgYXBwRGlyZWN0b3J5OiAnc3JjJyxcbiAgICAgICAgICAgIHNlcnZlck1vZHVsZUZvcm1hdDogJ2NqcycsXG4gICAgICAgICAgICBmdXR1cmU6IHtcbiAgICAgICAgICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1bnN0YWJsZV9zaW5nbGVGZXRjaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICAgIHRzY29uZmlnUGF0aHMoKSxcbiAgICAgICAge1xuICAgICAgICAgICAgYXBwbHkoY29uZmlnLCBlbnYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW52LmlzU3NyQnVpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLi4udmlzdWFsaXplcih7IGZpbGVuYW1lOiAnYnVpbGQvdHJhY2UuaHRtbCcgfSksXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGJ1bmRsZUdyYXBoUGx1Z2luKCksXG4gICAgXSxcblxuICAgIHNzcjoge1xuICAgICAgICBub0V4dGVybmFsOiBidWlsZGluZyB8fCB1bmRlZmluZWQsXG4gICAgICAgIGV4dGVybmFsOiBidWlsZGluZ1xuICAgICAgICAgICAgPyBbJ0BwcmlzbWEvY2xpZW50JywgJ0BzZW50cnkvbm9kZScsICdodG1scmV3cml0ZXInXVxuICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSxcblxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICAvLyBpbmNsdWRlOiBbJ0BzZW50cnkvbm9kZSddLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGxlZ2FjeToge1xuICAgICAgICBwcm94eVNzckV4dGVybmFsTW9kdWxlczogdHJ1ZSxcbiAgICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1YsU0FBUyxjQUFjLGFBQWE7QUFFMVgsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sdUJBQXVCO0FBRTlCLFNBQVMsa0JBQWtCO0FBRTNCLElBQU0sV0FBVyxRQUFRLElBQUksYUFBYTtBQUUxQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixhQUFhO0FBQUEsRUFDYixRQUFRO0FBQUEsSUFDSix3QkFBd0IsS0FBSyxVQUFVLFFBQVEsSUFBSSxRQUFRO0FBQUEsRUFDL0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGtCQUFrQixPQUFPLEVBQUUsUUFBUSxTQUFTLENBQUM7QUFBQSxJQUM3QyxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDRixjQUFjO0FBQUEsTUFDZCxvQkFBb0I7QUFBQSxNQUNwQixRQUFRO0FBQUEsUUFDSixtQkFBbUI7QUFBQSxRQUNuQixzQkFBc0I7QUFBQSxRQUN0QixzQkFBc0I7QUFBQSxRQUN0QixxQkFBcUI7QUFBQSxNQUN6QjtBQUFBLElBQ0osQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLElBQ2Q7QUFBQSxNQUNJLE1BQU0sUUFBUSxLQUFLO0FBQ2YsWUFBSSxJQUFJLFlBQVk7QUFDaEIsaUJBQU87QUFBQSxRQUNYO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLEdBQUcsV0FBVyxFQUFFLFVBQVUsbUJBQW1CLENBQUM7QUFBQSxJQUNsRDtBQUFBO0FBQUEsRUFFSjtBQUFBLEVBRUEsS0FBSztBQUFBLElBQ0QsWUFBWSxZQUFZO0FBQUEsSUFDeEIsVUFBVSxXQUNKLENBQUMsa0JBQWtCLGdCQUFnQixjQUFjLElBQ2pEO0FBQUEsRUFDVjtBQUFBLEVBRUEsY0FBYztBQUFBO0FBQUEsRUFFZDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsaUJBQWlCO0FBQUEsTUFDYix5QkFBeUI7QUFBQSxJQUM3QjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLHlCQUF5QjtBQUFBLEVBQzdCO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
