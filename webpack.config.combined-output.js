/**
 * A Demo Webpack Configuration
 *
 * This is to demonstrate things that can be done with webpack, feel free to pull this
 * and ammend content and see what happens when you execute the package.json commands.
 *
 * Build steps can be executed via the script referenced in the package.json.
 */

/**
 * Clean plugin for webpack
 * A webpack plugin to remove/clean your build folder(s).
 * https://github.com/johnagan/clean-webpack-plugin
 */
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

/**
 * Copy webpack plugin
 * Uses this to copy assets, images etc, to a given folder on build
 * In this instance, the plugin will copy all the images to the dist folder post build
 * https://github.com/webpack-contrib/copy-webpack-plugin
 */
const copyWebpackPlugin = require("copy-webpack-plugin");

/**
 * Path Module
 * The path module provides utilities for working with file and directory paths.
 * https://nodejs.org/docs/latest/api/path.html
 */
const path = require("path");

/**
 * A Webpack Plugin for babel-minify - A babel based minifier
 * https://webpack.js.org/plugins/babel-minify-webpack-plugin/
 */
const MinifyPlugin = require("babel-minify-webpack-plugin");

/**
 * Get environment variables from the .env file, located in the root
 * Envirment variables can be added to the .env file and passed in
 * to a SASS file (or any other files, js etc) using the appropriate
 * 'loader'.  Presently, only the SASS loader is using this, as this
 * is to pass in a dev/prod value to set a SASS var to the correct
 * value.
 */
const envVars = require("dotenv").config({ path: "./.env" }).parsed;

/**
 * Simple check - is it prod or dev
 */
const devMode = envVars.NODE_ENV !== "production";

/**
 * Delete extraneous files generated when
 * working on css/scss files
 * For every entrypoint ref to a file, be it js or other,
 * a js file is generated
 */
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

/**
 * This plugin extracts CSS into separate files. It creates a
 * CSS file per JS file which contains CSS. It supports
 * On-Demand-Loading of CSS and SourceMaps.
 * https://github.com/webpack-contrib/mini-css-extract-plugin
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Remove files from given directories
 * https://www.npmjs.com/package/remove-files-webpack-plugin
 */
const RemovePlugin = require("remove-files-webpack-plugin");

/**
 * vue-loader is a loader for webpack that allows you to author Vue
 * components in a format called Single-File Components (SFCs).
 * https://vue-loader.vuejs.org/
 *
 */
const { VueLoaderPlugin } = require("vue-loader");

/**
 * Minimizer, uglifier and the like
 */
const TerserPlugin = require("terser-webpack-plugin");
const JavaScriptObfuscator = require("webpack-obfuscator");

/**
 * Glob entry, a means to find entry files by a glob pattern
 * https://www.npmjs.com/package/webpack-glob-entry
 */
var globEntry = require("webpack-glob-entry");

/**
 * Get the PostCss loader plugins
 * If in production, minification is carried out
 * as well as removing excess content from css files
 * (comments, doctypes in svg refs)
 */
const getPostCssPlugins = () => {
	if (!devMode) {
		return [
			require("autoprefixer")(),
			require("cssnano")({
				preset: [
					"default",
					{
						discardComments: { removeAll: true },
						svgo: {
							plugins: [
								{
									removeDoctype: devMode ? false : true,
								},
							],
						},
					},
				],
			}),
		];
	} else {
		return [require("autoprefixer")()];
	}
};

module.exports = {
	/**
	 * Detect env from .env file in proj root.
	 * If no ennVars found, defaults to production,
	 * to prevent any chance of dev code making it live.
	 */
	mode: envVars.NODE_ENV || "production",
	entry: {
		/**
		 * Alternatively, you can reference the files
		 * individually or as an array
		 * execute a build for this by uncommenting, commenting the 'entry'
		 * instance and firing the command
		 */
		"css/styles.css": [
			"./assets/scss/webpack-demo-scss.scss",
			"./assets/scss/webpack-demo-scss.alt.scss",
			"./assets/custom-css/webpack-demo-custom-css.css",
			"./assets/vendor-css/webpack-demo-vendor-css.css",
		],
		"js/modules.js": Object.values(globEntry("./assets/js/**/*.js")),
		"vueapp/index.js": ["./vue.app/src/main.js"],
	},

	resolve: {
		/**
		 * Path to node_modules
		 */

		modules: [
			path.resolve(__dirname, "assets"),
			path.resolve(__dirname, "node_modules"),
			path.resolve(__dirname, "Images"),
		],
		alias: {
			/**
			 * Keys defined for image paths
			 * These keys can then be used in Scss files, js files etc
			 * This saves any requirement to make abs paths (i.e. ../../../../file.js)
			 *
			 * NOT WORKING YET FOR BACKGROUND-IMAGES.. :O(
			 */
			ImagesPath: path.resolve(__dirname, "Images"),
			vue$: path.resolve(__dirname, "node_modules/vue/dist/vue.esm.js"),
		},
		/**
		 * Extensions of files where these keys *should* be accessible from
		 */
		extensions: [".js", ".json", ".scss", ".vue", ".css"],
	},

	output: {
		/**
		 * Path to output to.
		 * Defaults to ./dist if left commented out
		 * See package.json script commands as i have used the -o (output flag)
		 * on the command, meaning this isnt needed
		 * (There is a command to compile js separately, and a command to compile js
		 * into a single file)
		 */
		filename: "[name].js",
		path: path.resolve(__dirname, "dist-combined"),
		publicPath: "/dist-combined/",
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				/**
				 * https://github.com/terser/terser#minify-options
				 */
				terserOptions: {
					ecma: null,
					warnings: false,
					parse: false,
					compress: false,
					mangle: false,
					module: false,
					output: null,
					toplevel: false,
					nameCache: null,
					ie8: false,
					keep_classnames: undefined,
					keep_fnames: false,
					safari10: false,
				},
			}),
		],
	},
	plugins: [
		/**
		 * Clear out old files when recompiling
		 */
		new CleanWebpackPlugin(),
		/**
		 * Clear out old files when recompiling
		 * Before and After build
		 * Here, before build delete the webpack generated css files
		 */
		new RemovePlugin({
			before: {
				include: [path.resolve(__dirname, "dist-combined")],
			},
			after: {
				test: [
					{
						folder: "dist-combined/js",
						method: (filePath) => {
							return new RegExp(/\.js.LICENSE.txt$/, "m").test(
								filePath
							);
						},
					},
					{
						folder: "dist-combined/css",
						method: (filePath) => {
							return new RegExp(/\.js.LICENSE.txt$/, "m").test(
								filePath
							);
						},
					},
					{
						folder: "dist-combined/vueapp",
						method: (filePath) => {
							return new RegExp(/\.js.LICENSE.txt$/, "m").test(
								filePath
							);
						},
					},
				],
			},
		}),
		new copyWebpackPlugin([
			{ from: "./assets/images", to: "./images" },
			{
				from:
					"./assets/templates/resulting-index-combined-files-js.html",
				to: "./resulting-index-combined-files-js.html",
			},
		]),
		new MiniCssExtractPlugin(),

		new VueLoaderPlugin(),
		new TerserPlugin(),
		// new JavaScriptObfuscator({
		// 	identifierNamesGenerator: "mangled"
		// }),
	],
	module: {
		rules: [
			/**
			 * This may be needed to resolve image paths for images refereced in
			 * 	the css, but maybe not
			 * - leaving in just in case for now
			 */
			{
				test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg|png)(\?[a-z0-9=.]+)?$/,
				use: [
					{
						loader: "url-loader?limit=200000",
					},
				],
			},
			{
				test: /\.(sass|scss|css)$/,
				exclude: [path.resolve(__dirname, "vue.app")],
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: "css-loader",
						query: {
							importLoaders: 1,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							ident: "postcss",
							plugins: (loader) => [
								require("postcss-import")(),
								require("postcss-cssnext")({
									features: {
										customProperties: { warnings: false },
									},
								}),
								require("postcss-font-magician")(),
							],
						},
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: devMode ? true : false,
							sassOptions: {
								outputStyle: devMode
									? "expanded"
									: "compressed",
							},
							/**
							 * Pass in the env var to the sass files,
							 * defined in this case as $environment.
							 * As many other vars can be defined and passed
							 * into the sass in the same way
							 */
							prependData: (loaderContext) => {
								// More information about available properties https://webpack.js.org/api/loaders/
								const {
									resourcePath,
									rootContext,
								} = loaderContext;
								const relativePath = path.relative(
									rootContext,
									resourcePath
								);

								if (
									relativePath ===
									"assets/scss/webpack-demo-scss.alt.scss"
								) {
									return (
										"$MyVar:'" +
										envVars.MyVar +
										"'; $MyVar2: 'something-for-alt-scss';"
									);
								}

								return (
									"$MyVar:'" +
									envVars.MyVar +
									"'; $MyVar2: 'something-for-scss';"
								);
							},
						},
					},
				],
			},

			/**
			 * VUE and JS
			 */
			{
				test: /\.js$/,
				use: [
					{
						loader: "babel-loader",
						query: {
							presets: [require.resolve("babel-preset-env")],
						},
					},
				],
				include: [path.resolve(__dirname, "vue.app")],
				exclude: [path.resolve(__dirname, "node_modules")],
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
				include: [path.resolve(__dirname, "vue.app")],
				options: {
					plugins: (loader) => {
						new VuetifyLoaderPlugin();
					},
				},
				exclude: [path.resolve(__dirname, "node_modules")],
			},
			{
				test: /\.s?css$/,
				include: [path.resolve(__dirname, "vue.app")],
				use: ["vue-style-loader", "css-loader", "sass-loader"],
			},
		],
	},
};
