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
                hostname: "apocrypha-bucket-book-imgs-5bfe43ee-e15a-4c6d-be9d-bc6556535ac8.s3.amazonaws.com",
                pathname: "/**",
            },
        ],
    },
}

export default config
