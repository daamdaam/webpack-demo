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
 const copyWebpackPlugin = require('copy-webpack-plugin');

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

module.exports = {
	/**
	 * Detect env from .env file in proj root.
	 * If no ennVars found, defaults to production,
	 * to prevent any chance of dev code making it live.
	 */
	mode: envVars.NODE_ENV || "production",
	entry: {
		/**
		 * Main entry points, 
		 * i.e. where all the sass files are referenced.
		 * 'entry' instances reference js files which can 
		 * import js modules and also reference scss/css 
		 * files, where scss files can also reference other scss files.
		*/
		"js/moduleOne.js": "./assets/js/moduleOne.js",
		"js/moduleTwo.js": "./assets/js/moduleTwo.js",
		"js/moduleThree.js": "./assets/js/moduleThree.js",
		"css/main.css": "./assets/scss/webpack-demo-scss.scss",
		"css/vendor.css": [
			"./assets/vendor-css/webpack-demo-vendor-css.css" 
		],
		"css/custom.css": [
			"./assets/custom-css/webpack-demo-custom-css.css"
		],
		// "vueapp": [
		// 	"./vue.app/src/main.js"
		// ]
	},

	resolve: {
		/**
		 * Path to node_modules
		 */		
		modules: [
			path.resolve(__dirname, 'assets'),
			path.resolve(__dirname, 'node_modules'),
			path.resolve(__dirname, 'Images'),
		],
		alias: {
			/**
			 * Keys defined for image paths
			 * These keys can then be used in Scss files, js files etc
			 * This saves any requirement to make abs paths (i.e. ../../../../file.js)
			 * 
			 * NOT WORKING YET FOR BACKGROUND-IMAGES.. :O(
			 */
			"ImagesPath": path.resolve(__dirname, "assets/Images")
		},
		/**
		 * Extensions of files where these keys *should* be accessible from
		 */
		extensions: [".js", ".json", ".scss", ".vue", ".css"]
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
		path: path.resolve(__dirname, "dist"),
		publicPath: "/dist/"
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
				include: [
					path.resolve(__dirname, 'dist')
				]
			},
			after: {
				test: [
					{
						folder: "dist/css",
						method: filePath => {
							return new RegExp(/\.css.js$/, "m").test(filePath);
						}
					}
				]
			}
		}),
		new copyWebpackPlugin([
			{ from: './assets/images', to: './images' },
			{ from: './assets/templates/resulting-index-separate-js.html', to: './resulting-index-separate-js.html' }
		  ]), 
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
								outputStyle: devMode ? "expanded" : "compressed"
							},
							/**
							 * Pass in the env var to the sass files,
							 * defined in this case as $environment.
							 * As many other vars can be defined and passed
							 * into the sass in the same way
							 */
							prependData: "$MyVar:'" + envVars.MyVar + "';"
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
						
						//loader: MiniCssExtractPlugin.loader,
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
						loader: 'file-loader'
					},
					// {
					// 	loader: 'extract-loader'
					// },
					// {
					// 	loader: "url-loader?limit=200000"
					// },
				]
			}
		]
	}
};