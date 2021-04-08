/* eslint-disable @typescript-eslint/no-var-requires */
// Mostly inlined from within `customize-cra` https://www.npmjs.com/package/customize-cra
const getBabelLoader = (config) => {
  // Filtering out rules that don't define babel plugins.
  const babelLoaderFilter = (rule) =>
    rule.loader &&
    rule.loader.includes('babel') &&
    rule.options &&
    rule.options.plugins

  // First, try to find the babel loader inside the oneOf array.
  // This is where we can find it when working with react-scripts@2.0.3.
  let loaders = config.module.rules.find((rule) => Array.isArray(rule.oneOf))
    .oneOf

  let babelLoader = loaders.find(babelLoaderFilter)

  // If the loader was not found, try to find it inside of the "use" array, within the rules.
  // This should work when dealing with react-scripts@2.0.0.next.* versions.
  if (!babelLoader) {
    loaders = loaders.reduce((ldrs, rule) => ldrs.concat(rule.use || []), [])
    babelLoader = loaders.find(babelLoaderFilter)
  }
  return babelLoader
}

// Curried function that uses config to search for babel loader and pushes new plugin to options list.
// const addBabelPlugin = (plugin) => (config) => {
//   getBabelLoader(config).options.plugins.push(plugin)
//   return config
// }

module.exports = function override(config) {
  const babelPlugin = getBabelLoader(config)

  babelPlugin.options.babelrc = true

  // add files to load from /common
  babelPlugin.include = [].concat(
    babelPlugin.include,
    require('path').resolve(__dirname, '../common'),
  )

  if (process.env.NODE_ENV !== 'production') {
    const ESLintPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'ESLintWebpackPlugin',
    )

    ESLintPlugin.options.extensions = '.never'

    const TsCheckerPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin',
    )
    TsCheckerPlugin.options.typescript = false
    TsCheckerPlugin.options.eslint = undefined

    // resolve common folder not from node_modules
    config.resolve.modules.unshift(require('path').resolve(__dirname, '../'))
  }

  return config
}
