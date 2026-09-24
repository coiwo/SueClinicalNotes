/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  distDir: process.env.SUE_TEST_DIST || ".next",
  async headers() { return [{source:"/:path*",headers:[{key:"Cache-Control",value:"no-store"},{key:"X-Frame-Options",value:"DENY"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"no-referrer"}]}]; }
};

export default config;
