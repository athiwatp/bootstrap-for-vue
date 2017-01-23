const rollup = require('rollup').rollup
const vue = require('rollup-plugin-vue')
const buble = require('rollup-plugin-buble')
const uglify = require('uglify-js')
const CleanCSS = require('clean-css')
const packageData = require('../package.json')
const { version, author, name } = packageData
// remove the email at the end
const authorName = author.replace(/\s+<.*/, '')

const {
  logError,
  write,
  processStyle
} = require('./utils')

const banner =
      '/*!\n' +
      ` * ${name} v${version}\n` +
      ` * (c) ${new Date().getFullYear()} ${authorName}\n` +
      ' * Released under the MIT License.\n' +
      ' */'

rollup({
  entry: 'src/index.js',
  plugins: [
    vue({
      compileTemplate: true,
      css (styles, stylesNodes) {
        Promise.all(
          stylesNodes.map(processStyle)
        ).then(css => {
          const result = css.map(c => c.css).join('')
          // write the css for every component
          // TODO add it back if we extract all components to individual js
          // files too
          // css.forEach(writeCss)
          write(`dist/${name}.css`, result)
          write(`dist/${name}.min.css`, new CleanCSS().minify(result).styles)
        }).catch(logError)
      }
    }),
    buble({
      objectAssign: 'Object.assign'
    })
  ]
}).then(function (bundle) {
  var es = bundle.generate({
    format: 'es'
  }).code

  write(`dist/${name}.js`, es)

  var code = bundle.generate({
    format: 'umd',
    exports: 'named',
    banner: banner,
    moduleName: name
  }).code
  return write(`dist/${name}.umd.js`, code).then(function () {
    return code
  })
}).then(function (code) {
  var minified = uglify.minify(code, {
    fromString: true,
    output: {
      preamble: banner,
      ascii_only: true
    }
  }).code
  return write(`dist/${name}.umd.min.js`, minified)
}).catch(logError)
