import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import createVitePlugins from './vite/plugins';
import dayjs from 'dayjs';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { updateVendorCache } from './build/vendor';
import versionUpdatePlugin from './src/utils/versionUpdatePlugin';
import importToCDN from 'vite-plugin-cdn-import';

const cdnModules = [
  { name: 'axios', var: 'axios', path: 'https://cdn.staticfile.org/axios/0.21.1/axios.min.js' },
  { name: 'dayjs', var: 'dayjs', path: 'https://cdn.staticfile.org/dayjs/1.11.13/dayjs.min.js' },
  { name: 'crypto-js', var: 'CryptoJS', path: 'https://cdn.staticfile.org/crypto-js/4.1.1/crypto-js.min.js' },
  { name: 'js-cookie', var: 'Cookies', path: 'https://cdn.staticfile.org/js-cookie/3.0.0/js.cookie.min.js' },
  { name: 'bignumber.js', var: 'BigNumber', path: 'https://cdn.staticfile.org/bignumber.js/9.1.2/bignumber.min.js' },
  {
    name: 'nprogress',
    var: 'NProgress',
    path: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.js',
    css: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.min.css',
  },
  { name: 'echarts', var: 'echarts', path: 'https://cdn.staticfile.net/echarts/5.4.3/echarts.common.min.js' },
  { name: 'codemirror', var: 'CodeMirror', path: 'https://cdn.staticfile.org/codemirror/5.65.18/codemirror.js' },
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
    importToCDN({ injectTo: 'head', modules: cdnModules })
  ];

  if (isBuild && !isLocal) {
    plugins.push(versionUpdatePlugin({ version: currentTimeVersion }));
  }

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
      alias: {
        '~': resolve(__dirname, './'),
        '@': resolve(__dirname, './src'),
        '~@': resolve(__dirname, './src'),
        '@public': resolve(__dirname, './public'),
        components: resolve(__dirname, './src/components'),
        styles: resolve(__dirname, './src/styles'),
        utils: resolve(__dirname, './src/utils'),
        axios: resolve(__dirname, './src/axios.js'),
        dayjs: resolve(__dirname, './src/cdn/dayjs.js'),
        'crypto-js': resolve(__dirname, './src/cdn/crypto-js.js'),
        'js-cookie': resolve(__dirname, './src/cdn/js-cookie.js'),
        nprogress: resolve(__dirname, './src/cdn/nprogress.js'),
        'nprogress/nprogress.css': resolve(
          __dirname,
          './src/cdn/nprogress.css'
        ),
        echarts: resolve(__dirname, './src/cdn/echarts.js'),
        'bignumber.js': resolve(__dirname, './src/cdn/bignumber.js'),
        codemirror: resolve(__dirname, './src/cdn/codemirror.js'),
      },
    },
    plugins,
    build: {
      target: 'esnext',
      minify: isProd ? 'terser' : 'esbuild',
      rollupOptions: {
        external: [
          'axios',
          'dayjs',
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
            axios: 'https://cdn.staticfile.org/axios/0.21.1/axios.min.js',
            dayjs: 'https://cdn.staticfile.org/dayjs/1.11.13/dayjs.min.js',
            'crypto-js': 'https://cdn.staticfile.org/crypto-js/4.1.1/crypto-js.min.js',
            'js-cookie': 'https://cdn.staticfile.org/js-cookie/3.0.0/js.cookie.min.js',
            'bignumber.js': 'https://cdn.staticfile.org/bignumber.js/9.1.2/bignumber.min.js',
            nprogress: 'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.js',
            echarts: 'https://cdn.staticfile.net/echarts/5.4.3/echarts.common.min.js',
            codemirror: 'https://cdn.staticfile.org/codemirror/5.65.18/codemirror.js',
          },
          globals: {
            axios: 'axios',
            dayjs: 'dayjs',
            'crypto-js': 'CryptoJS',
            'js-cookie': 'Cookies',
            'bignumber.js': 'BigNumber',
            nprogress: 'NProgress',
            echarts: 'echarts',
            codemirror: 'CodeMirror',
          },
          entryFileNames: '[name].[hash].js',
          chunkFileNames: chunkInfo =>
            chunkInfo.name === 'vendor'
              ? `vendor-${updateVendorCache(mode)}.js`
              : 'chunks/[name].[hash].js',
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
        'axios',
        'dayjs',
        'crypto-js',
        'js-cookie',
        'bignumber.js',
        'nprogress',
        'echarts',
        'codemirror',
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
