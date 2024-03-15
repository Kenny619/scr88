import webpack from "webpack";
export function override(config) {
	const fallback = config.resolve.fallback || {};
	Object.assign(fallback, {
		fs: false,
		net: false,
		tls: false,
		path: false,
		zlib: require.resolve("browserify-zlib"),
		crypto: require.resolve("crypto-browserify"),
		stream: require.resolve("stream-browserify"),
		assert: require.resolve("assert"),
		http: require.resolve("stream-http"),
		https: require.resolve("https-browserify"),
		os: require.resolve("os-browserify"),
		url: require.resolve("url"),
		//child_process: false,
	});
	config.resolve.fallback = fallback;
	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: "process/browser",
			Buffer: ["buffer", "Buffer"],
		}),
	]);
	return config;
}
