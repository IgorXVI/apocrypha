/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const config = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                pathname: "/f/**",
            },
            {
                protocol: "https",
                hostname: "d32155ei7f8k3w.cloudfront.net",
                pathname: "/**",
            },
        ],
    },
}

export default config
