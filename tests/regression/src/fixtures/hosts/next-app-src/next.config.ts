import type { NextConfig } from "next";

const config: NextConfig = {
	typescript: { ignoreBuildErrors: false },
	eslint: { ignoreDuringBuilds: true },
};

export default config;
