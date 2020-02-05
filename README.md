# webpack-demo

You can do a build using the commands 

$ npm run webpackCombined

This creates JS files that are combined into one file.  The CSS files, from standard css or scss, are created as separate files.

$ npm run webpackSeparate

This creates JS files that are separate, but referenced by a main JS file which needs to be used in the index.html (or whatever).  This does mean that the main bundle and the other generated files need to be deployed to each environment.

--

You can examine the webpack config file and see the loaders that are being fired on a build.

--

You can view the index files by starting the http server, which is a module installed as part of this package (npm i, to install the modules).

You can then view the pages on:

http://localhost:8080/resulting-index-separate-js.html

and

http://localhost:8080/resulting-index-combined-js.html

After executing the appropriate commands in the package.json
