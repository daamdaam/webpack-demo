# webpack-demo
 
This repo will demonstrate some webpack setups that can be used in your projects.

## Webpack to build combined assets

Below each package.json script is explained.

#### $ npm run webpackCombined

This creates JS files that are combined into one file. The CSS files, from standard css or scss, are created as separate files or as combined, depending on how the entry point is defined.  

Note: GLOBs can be used to create a collection of files of the same extension, which can be set as a single entry point and will combine all files into one CSS file.  See line 134 of webpack.config.separate-output.js and line 146 of webpack.config.combined-output.js.

The output can be seen on:
#### http://localhost:10001/resulting-index-combined-js.html

## Webpack to build separate assets

#### $ npm run webpackSeparate

This creates JS files that are separate, but referenced by a main JS file which needs to be used in the index.html (or whatever).  All the CSS is put into same file, _styles.css_.

The output can be seen on:

#### http://localhost:10002/resulting-index-separate-js.html

## Merged webpack instance

I created a final webpack instance consisting of a generic base webpack, inside of which global configs are defined, such as loaders to use, plugins to use, definitions of devMode etc.   THey are merged via an npm package, 'webpack-merge' (https://www.npmjs.com/package/webpack-merge), and the script can be fired which will start a build.  The output of which is the same as the separate instance.

The output can be seen on:
#### http://localhost:10003/resulting-index-merged-webpack-instance.html

## Each webpack instance

Each webpack on the whole has he same setup, some of the entry points are defined differently, but this is to show the various ways that entry points can be defined; via an import in a js file, via a manual array of files or via a glob patter to find all files of a given type in a given location.

All imported and required node modules have been described with links to where they were taken from.

--

## Package.json

The scripts have been added here:

* "wpsep": Fire a build process for the separate file output.
* "wpcom": Fire a build process for the combined file output.
* "wpmerged": Fire the build process using the merged webpack instance.
* "httpserver": Simple local server to make specified folders available on a given port in a browser.
* "srvcom": Serve the combined files output on the specified port.
* "srvsep": Serve the separate files output on the specified port.
* "srvmerged": Serve the merged webpack instance files output on the specified port.
* "sep": Build and then serve the separate files output on the specified port.
* "combined": Build and then serve the combined files output on the specified port.
* "merged": Build and then serve the merged webpack instance files on the specified port."

The above commands are executed as 

#### $npm run [script-name]
