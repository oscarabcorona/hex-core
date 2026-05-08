import type { AppProps } from "next/app";

/** Custom App entry — minimal scaffold for the regression suite. */
export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
