// const IS_DEV = process.env.NODE_ENV === 'development'
const IS_PROD = process.env.NODE_ENV === 'production'
const path = require('path')
// const webpack = require('webpack')

module.exports = {
  productionSourceMap: false,
  publicPath: IS_PROD ? 'https://web-cdn.agora.io/dashboardv2/' : '/',
  runtimeCompiler: true,
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      alias: {
        less: path.resolve('./less'),
        src: path.resolve('./src'),
        vue$: 'vue/dist/vue.esm.js',
        img: path.resolve('./src/assets/image'),
        i18n: path.resolve('./src/i18n'),
        models: path.resolve('./src/models'),
      },
      extensions: ['.js', '.json', '.vue'],
      mainFiles: ['index'],
    },
    stats: 'errors-only',
    // plugins: [
    //   new webpack.HotModuleReplacementPlugin()
    // ]
  },

  pluginOptions: {
    windicss: {
      // see https://github.com/windicss/vite-plugin-windicss/blob/main/packages/plugin-utils/src/options.ts
    },
  },

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index.html',
    },
  },
  devServer: {
    port: 3088,
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3188',
        ws: false,
        changeOrigin: false,
      },
      '/sso': {
        target: 'http://localhost:3188',
        ws: false,
        changeOrigin: false,
      },
      '/sudo': {
        target: 'http://localhost:3188',
        ws: false,
        changeOrigin: false,
      },
      '/action': {
        target: 'http://127.0.0.1:3188',
        ws: false,
        changeOrigin: false,
      },
    },
  },
  // chainWebpack: (config) => {
  //   config.module
  //     .rule('i18n')
  //     .resourceQuery(/blockType=i18n/)
  //     .type('javascript/auto')
  //     .use('i18n')
  //     .loader('@kazupon/vue-i18n-loader')
  //     .end()
  //   config.module
  //     .rule('tpl')
  //     .test(/\.tpl?$/)
  //     .use('html-loader')
  //     .loader('html-loader')
  //   config.module
  //     .rule('html')
  //     .test(/\.html?$/)
  //     .use('vue-template-loader')
  //     .loader('vue-template-loader')
  //   config.plugin('provide').use(webpack.ProvidePlugin, [
  //     {
  //       Vue: ['vue/dist/vue.runtime.esm.js', 'default'],
  //       $: 'jquery',
  //       jQuery: 'jquery',
  //       introJs: ['intro.js', 'introJs'],
  //       _: 'lodash',
  //     },
  //   ])
  //   config.plugins.delete('friendly-errors')
  // },
}
