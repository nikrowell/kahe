const buble = require('rollup-plugin-buble');
const pkg = require('./package.json');

var config = {
    moduleName: 'turbine',
    banner: `/*! ${pkg.name} ${pkg.version} */`,
    entry: 'src/index.js',
    format: 'umd',
    indent: true,
    plugins: [ buble() ]
};

if(!process.env.BUILD) {
    config.dest = pkg.main;
    config.sourceMap = true;
}

export default config;