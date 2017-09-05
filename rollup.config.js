const buble = require('rollup-plugin-buble');
const pkg = require('./package.json');

export default {
    input: 'src/index.js',
    output: {
        name: 'kahe',
        file: 'kahe.js',
        format: 'umd',
        sourcemap: true
    },
    banner: `/*! ${pkg.name} ${pkg.version} */`,
    indent: true,
    plugins: [ buble() ]
};