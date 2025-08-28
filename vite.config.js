import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import createVitePlugins from './vite/plugins';
import dayjs from 'dayjs';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import importToCDN from 'vite-plugin-cdn-import';

const cdnModules = [
  { name: 'axios', var: 'axios', path: 'https://cdn.staticfile.org/axios/0.21.1/axios.min.js' },
  { name: 'dayjs', var: 'dayjs', path: 'https://cdn.staticfile.org/dayjs/1.11.13/dayjs.min.js' },
  {
    name: 'dayjs/plugin/localeData.js',
    var: 'dayjs_plugin_localeData',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/localeData.min.js',
  },
  {
    name: 'dayjs/plugin/customParseFormat.js',
    var: 'dayjs_plugin_customParseFormat',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/customParseFormat.min.js',
  },
  {
    name: 'dayjs/plugin/advancedFormat.js',
    var: 'dayjs_plugin_advancedFormat',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/advancedFormat.min.js',
  },
  {
    name: 'dayjs/plugin/weekOfYear.js',
    var: 'dayjs_plugin_weekOfYear',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/weekOfYear.min.js',
  },
  {
    name: 'dayjs/plugin/weekYear.js',
    var: 'dayjs_plugin_weekYear',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/weekYear.min.js',
  },
  {
    name: 'dayjs/plugin/dayOfYear.js',
    var: 'dayjs_plugin_dayOfYear',
    path: 'https://cdn.staticfile.org/dayjs/1.11.13/plugin/dayOfYear.min.js',
  },
  {
    name: 'crypto-js',
    var: 'CryptoJS',
    path: 'https://cdn.staticfile.org/crypto-js/4.1.1/crypto-js.min.js',
  },
  {
    name: 'js-cookie',
    var: 'Cookies',
    path: 'https://cdn.staticfile.org/js-cookie/3.0.0/js.cookie.min.js',
  },
  {
    name: 'bignumber.js',
    var: 'BigNumber',
    path: 'https://cdn.staticfile.org/bignumber.js/9.1.2/bignumber.min.js',
  },
  {
    name: 'nprogress',
    var: 'NProgress',
    path: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.js',
    css: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.min.css',
  },
  {
    name: 'echarts',
    var: 'echarts',
    path: 'https://cdn.staticfile.net/echarts/5.4.3/echarts.common.min.js',
  },
  {
    name: 'codemirror',
    var: 'CodeMirror',
    path: 'https://cdn.staticfile.org/codemirror/5.65.18/codemirror.js',
  },
];

export default ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_BASE_URL, VITE_WEIGHT, VITE_APP_API, VITE_APP_ENV, VITE_APP_BASE } = env;

  const isProd = VITE_APP_ENV === 'production';
  const isLocal = VITE_APP_ENV === 'localhost';
  const isBuild = command === 'build';
  const currentTimeVersion = Date.now();

  const plugins = [
    createVitePlugins(env, isBuild),
    importToCDN({ injectTo: 'head', modules: cdnModules }),
  ];

  const proxyObj = {
    [VITE_APP_API]: {
      target: VITE_APP_BASE_URL,
      changeOrigin: true,
      rewrite: p => p.replace(VITE_APP_API, ''),
    },
    '/graphql/wiki': {
      target: 'https://wiki.eastwinbip.com/graphql',
      changeOrigin: true,
      rewrite: p => p.replace('/graphql/wiki', ''),
    },
    '/weight': {
      target: `${VITE_WEIGHT}/weight`,
      changeOrigin: true,
      rewrite: p => p.replace('^/weight', ''),
    },
    '/socket.io': {
      target: `${VITE_WEIGHT}/socket.io`,
      changeOrigin: true,
    },
    '/pdf-printing': {
      target: 'https://www.eastwinbip.com/pdf-printing',
      changeOrigin: true,
    },
  };

  return defineConfig({
    base: VITE_APP_BASE,
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __INTLIFY_PROD_DEVTOOLS__: false,
      'import.meta.env.VITE_APP_VERSION': currentTimeVersion,
    },
    server: {
      port: 2888,
      open: true,
      proxy: proxyObj,
    },
    resolve: {
      alias: [
        { find: '~', replacement: resolve(__dirname, './') },
        { find: '@', replacement: resolve(__dirname, './src') },
        { find: '~@', replacement: resolve(__dirname, './src') },
        { find: '@public', replacement: resolve(__dirname, './public') },
        { find: 'components', replacement: resolve(__dirname, './src/components') },
        { find: 'styles', replacement: resolve(__dirname, './src/styles') },
        { find: 'utils', replacement: resolve(__dirname, './src/utils') },
        {
          find: 'dayjs/plugin/customParseFormat.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-customParseFormat.js'),
        },
        {
          find: 'dayjs/plugin/customParseFormat',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-customParseFormat.js'),
        },
        {
          find: 'dayjs/plugin/advancedFormat.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-advancedFormat.js'),
        },
        {
          find: 'dayjs/plugin/advancedFormat',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-advancedFormat.js'),
        },
        {
          find: 'dayjs/plugin/weekOfYear.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-weekOfYear.js'),
        },
        {
          find: 'dayjs/plugin/weekOfYear',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-weekOfYear.js'),
        },
        {
          find: 'dayjs/plugin/weekYear.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-weekYear.js'),
        },
        {
          find: 'dayjs/plugin/weekYear',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-weekYear.js'),
        },
        {
          find: 'dayjs/plugin/dayOfYear.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-dayOfYear.js'),
        },
        {
          find: 'dayjs/plugin/dayOfYear',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-dayOfYear.js'),
        },
        {
          find: 'dayjs/plugin/localeData.js',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-localeData.js'),
        },
        {
          find: 'dayjs/plugin/localeData',
          replacement: resolve(__dirname, './src/cdn/dayjs-plugin-localeData.js'),
        },
        { find: 'axios', replacement: resolve(__dirname, './src/cdn/axios.js') },
        { find: 'dayjs', replacement: resolve(__dirname, './src/cdn/dayjs.js') },
        { find: 'crypto-js', replacement: resolve(__dirname, './src/cdn/crypto-js.js') },
        { find: 'js-cookie', replacement: resolve(__dirname, './src/cdn/js-cookie.js') },
        { find: 'nprogress', replacement: resolve(__dirname, './src/cdn/nprogress.js') },
        { find: 'echarts', replacement: resolve(__dirname, './src/cdn/echarts.js') },
        { find: 'bignumber.js', replacement: resolve(__dirname, './src/cdn/bignumber.js') },
        { find: 'codemirror', replacement: resolve(__dirname, './src/cdn/codemirror.js') },
      ],
    },
    plugins,
    build: {
      target: 'esnext',
      minify: isProd ? 'terser' : 'esbuild',
      rollupOptions: {
        external: [
          'dayjs',
          'dayjs/plugin/localeData.js',
          'dayjs/plugin/localeData',
          'dayjs/plugin/customParseFormat.js',
          'dayjs/plugin/customParseFormat',
          'dayjs/plugin/advancedFormat.js',
          'dayjs/plugin/advancedFormat',
          'dayjs/plugin/weekOfYear.js',
          'dayjs/plugin/weekOfYear',
          'dayjs/plugin/weekYear.js',
          'dayjs/plugin/weekYear',
          'dayjs/plugin/dayOfYear.js',
          'dayjs/plugin/dayOfYear',
          'crypto-js',
          'js-cookie',
          'bignumber.js',
          'nprogress',
          'echarts',
          'codemirror',
        ],
        output: {
          // 把裸导入重写到 CDN ESM/UMD 地址
          paths: {
            dayjs: 'https://cdn.staticfile.org/dayjs/1.11.13/dayjs.min.js',
            'crypto-js': 'https://cdn.staticfile.org/crypto-js/4.1.1/crypto-js.min.js',
            'js-cookie': 'https://cdn.staticfile.org/js-cookie/3.0.0/js.cookie.min.js',
            'bignumber.js': 'https://cdn.staticfile.org/bignumber.js/9.1.2/bignumber.min.js',
            nprogress: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.js',
            echarts: 'https://cdn.staticfile.net/echarts/5.4.3/echarts.common.min.js',
            codemirror: 'https://cdn.staticfile.org/codemirror/5.65.18/codemirror.js',
            'dayjs/plugin/localeData.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/localeData.min.js',
            'dayjs/plugin/customParseFormat.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/customParseFormat.min.js',
            'dayjs/plugin/advancedFormat.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/advancedFormat.min.js',
            'dayjs/plugin/weekOfYear.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/weekOfYear.min.js',
            'dayjs/plugin/weekYear.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/weekYear.min.js',
            'dayjs/plugin/dayOfYear.js':
              'https://cdn.staticfile.org/dayjs/1.11.13/plugin/dayOfYear.min.js',
          },
          globals: {
            dayjs: 'dayjs',
            'crypto-js': 'CryptoJS',
            'js-cookie': 'Cookies',
            'bignumber.js': 'BigNumber',
            nprogress: 'NProgress',
            echarts: 'echarts',
            codemirror: 'CodeMirror',
            'dayjs/plugin/localeData.js': 'dayjs_plugin_localeData',
            'dayjs/plugin/customParseFormat.js': 'dayjs_plugin_customParseFormat',
            'dayjs/plugin/advancedFormat.js': 'dayjs_plugin_advancedFormat',
            'dayjs/plugin/weekOfYear.js': 'dayjs_plugin_weekOfYear',
            'dayjs/plugin/weekYear.js': 'dayjs_plugin_weekYear',
            'dayjs/plugin/dayOfYear.js': 'dayjs_plugin_dayOfYear',
          },
          entryFileNames: '[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: id => (id.includes('node_modules') ? 'vendor' : undefined),
        },
      },
      outDir: `${dayjs().format('YYYY-MM-DD-HH-mm')}-${VITE_APP_ENV}-dist`,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
      exclude: [
        'dayjs',
        'dayjs/plugin/localeData.js',
        'dayjs/plugin/localeData',
        'dayjs/plugin/customParseFormat.js',
        'dayjs/plugin/customParseFormat',
        'dayjs/plugin/advancedFormat.js',
        'dayjs/plugin/advancedFormat',
        'dayjs/plugin/weekOfYear.js',
        'dayjs/plugin/weekOfYear',
        'dayjs/plugin/weekYear.js',
        'dayjs/plugin/weekYear',
        'dayjs/plugin/dayOfYear.js',
        'dayjs/plugin/dayOfYear',
        'crypto-js',
        'js-cookie',
        'bignumber.js',
        'nprogress',
        'echarts',
        'codemirror',
        'element-plus',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  });
};
