// import withPWAInit from "@ducanh2912/next-pwa";

/*
const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    workboxOptions: {
        importScripts: ["/custom-sw.js"],
    },
});
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
    }
};

export default nextConfig;
// export default withPWA(nextConfig);
