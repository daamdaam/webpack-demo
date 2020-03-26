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
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Remove files from given directories
 * https://www.npmjs.com/package/remove-files-webpack-plugin
 */
const RemovePlugin = require("remove-files-webpack-plugin");

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
									removeDoctype: devMode ? false : true
								}
							]
						}
					}
				]
			})
		];
	} else {
		return [require("autoprefixer")()];
	}
};

module.exports = (projectUrlBase) => {
	return {
		/**
		 * Detect env from .env file in proj root.
		 * If no ennVars found, defaults to production,
		 * to prevent any chance of dev code making it live.
		 */
		mode: envVars.NODE_ENV || "production",

		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						ecma: undefined,
						warnings: false,
						parse: {},
						compress: {},
						mangle: false, // Note `mangle.properties` is `false` by default.
						module: false,
						output: null,
						toplevel: false,
						nameCache: null,
						ie8: false,
						keep_classnames: undefined,
						keep_fnames: false,
						safari10: false
					}
				})
			]
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
					include: [path.resolve(__dirname, "dist-merged")]
				},
				after: {
					test: [
						{
							folder: "dist-merged/css",
							method: filePath => {
								return new RegExp(/\.css.js$/, "m").test(
									filePath
								);
							}
						},
						{
							folder: "dist-merged",
							method: filePath => {
								return new RegExp(/\.LICENSE.txt$/, "m").test(
									filePath
								);
							}
						}
					]
				}
			}),

			/**
			 * Copy files and assets on build
			 * I didnt do anything fancy with the html 
			 * templates, other than referencing the outputted 
			 * js and css files.
			 */
			new copyWebpackPlugin([
				{ from: "./assets/images", to: "./images" },
				{
					from: "./assets/templates/resulting-index-merged-webpack.html",
					to: "./resulting-index-merged-webpack.html"
				}
			]),

			/**
			 * Vue Loader 
			 */
			new VueLoaderPlugin(),
			new TerserPlugin(),
			new JavaScriptObfuscator({
				identifierNamesGenerator: "mangled"
			})
		],
		module: {
			rules: [
				/**
				 * Loaders to create and format the
				 * CSS on build
				 * NOTE: Build steps for module rules run in reverse!
				 * I.E. from bottom to top.
				 */
				{
					test: /\.(sass|scss)$/,
					exclude: [path.resolve(__dirname, "vue.app")],
					use: [
						{
							loader: "file-loader",
							options: {
								name: "[name].css",
								context: "./",
								outputPath: "./css/"
							}
						},
						{
							loader: "extract-loader"
						},
						{
							loader: "css-loader",
							options: {
								sourceMap: devMode ? true : false,
								importLoaders: 1,
								url: true
							}
						},
						{
							loader: "postcss-loader",
							options: {
								parser: "postcss-scss",
								ident: "postcss",
								plugins: () => getPostCssPlugins(),
								minimize: devMode ? false : true
							}
						},
						{
							loader: "sass-loader",
							options: {
								sourceMap: devMode ? true : false,
								sassOptions: {
									outputStyle: devMode
										? "expanded"
										: "compressed"
								},
								/**
								 * Pass in the env var to the sass files,
								 * defined in this case as $environment.
								 * As many other vars can be defined and passed
								 * into the sass in the same way
								 */

								prependData: loaderContext => {
									// More information about available properties https://webpack.js.org/api/loaders/
									const {
										resourcePath,
										rootContext
									} = loaderContext;
									const relativePath = path.relative(
										rootContext,
										resourcePath
									);

									if (
										relativePath ===
										"assets\\scss\\webpack-demo-scss.alt.scss"
									) {
										return (
											"$MyVar:" +
											envVars.MyVar +
											"; $MyVar2: 'something-for-alt-scss';"
										);
									}

									return (
										"$MyVar:'" +
										envVars.MyVar +
										"'; $MyVar2: '" + projectUrlBase + "';"
									);
								}
							}
						}
					]
				},

				/**
				 * This is for standard CSS files, i.e. not sass/less
				 * or any other css files that need compiling into CSS
				 */
				{
					test: /\.css$/,
					exclude: [path.resolve(__dirname, "vue.app")],
					use: [
						{
							loader: "file-loader",
							options: {
								name: "[name].css",
								context: "./",
								outputPath: "./css/"
							}
						},
						{
							loader: "extract-loader"
						},
						{
							loader: "css-loader",
							options: {
								sourceMap: devMode ? true : false,
								url: false
							}
						},
						{
							loader: "postcss-loader",
							options: {
								parser: "postcss-scss",
								ident: "postcss",
								plugins: () => getPostCssPlugins(),
								minimize: devMode ? false : true
							}
						}
					]
				},

				/**
				 * This may be needed to resolve image paths for images refereced in the css, but maybe not
				 * - leaving in just in case for now
				 */
				{
					test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg|png)(\?[a-z0-9=.]+)?$/,
					use: [
						{
							loader: "file-loader"
						}
					]
				},

				{
					test: /\.js$/,
					use: [
						{
							loader: "babel-loader",
							query: {
								presets: [require.resolve("babel-preset-env")]
							}
						}
					],
					include: [path.resolve(__dirname, "vue.app")],
					exclude: [path.resolve(__dirname, "node_modules")]
				},
				{
					test: /\.vue$/,
					loader: "vue-loader",
					include: [path.resolve(__dirname, "vue.app")],
					options: {
						plugins: loader => {
							new VuetifyLoaderPlugin();
						}
					},
					exclude: [path.resolve(__dirname, "node_modules")]
				},
				{
					test: /\.s?css$/,
					include: [path.resolve(__dirname, "vue.app")],
					use: ["vue-style-loader", "css-loader", "sass-loader"]
				}
			]
		}
	};
};
