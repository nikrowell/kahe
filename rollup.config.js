const buble = require('rollup-plugin-buble');
const pkg = require('./package.json');

export default {
    moduleName: 'turbine',
    banner: `/*! ${pkg.name} ${pkg.version} */`,
    entry: 'src/index.js',
    format: 'umd',
    indent: true,
    plugins: [ buble() ]
};