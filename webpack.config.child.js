/**
 * A Demo Webpack Child Configuration
 *
 * This webpack instance demonstrates merging a base instance with an environment specific instance
 * Where the ES instance contains settings specifically for the particular env.
 */
const merge = require("webpack-merge");

/**
 * Import the base
 */
const projectUrlBase = "/perspective"
const wpbc = require("./webpack.config.base")(projectUrlBase);

/**
 * Glob entry, a means to find entry files by a glob pattern
 * https://www.npmjs.com/package/webpack-glob-entry
 */
var globEntry = require('webpack-glob-entry');

/**
 * Define the environment specifics
 */
const envSpecificConfig = () => {
	/**
	 * Path Module
	 * The path module provides utilities for working with file and directory paths.
	 * https://nodejs.org/docs/latest/api/path.html
	 */
	const path = require("path");
	return {
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
			"css/main.css": Object.values(globEntry("./assets/scss/**/*.scss")),
			"css/vendor.css": [
				"./assets/vendor-css/webpack-demo-vendor-css.css"
			],
			"css/custom.css": [
				"./assets/custom-css/webpack-demo-custom-css.css"
			],
			"vueapp/index.js": ["./vue.app/src/main.js"]
		},
		resolve: {
			/**
			 * Path to node_modules
			 */

			modules: [
				path.resolve(__dirname, "assets"),
				path.resolve(__dirname, "node_modules"),
				path.resolve(__dirname, "Images")
			],
			alias: {
				/**
				 * Keys defined for image paths
				 * These keys can then be used in Scss files, js files etc
				 * This saves any requirement to make abs paths (i.e. ../../../../file.js)
				 *
				 * NOT WORKING YET FOR BACKGROUND-IMAGES.. :O(
				 */
				ImagesPath: path.resolve(__dirname, "assets/Images")
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
			path: path.resolve(__dirname, "dist-merged"),
			publicPath: "/dist-merged/"
		}
	};
};

/**
 * Merge both configs
 */
const output = merge(envSpecificConfig(), wpbc);

/**
 * Export to the command line
 */
module.exports = output;
