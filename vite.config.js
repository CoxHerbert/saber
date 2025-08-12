import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import createVitePlugins from './vite/plugins';
import dayjs from 'dayjs';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { updateVendorCache } from './build/vendor';
import versionUpdatePlugin from './src/utils/versionUpdatePlugin';

// https://vitejs.dev/config/
export default ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_BASE_URL, VITE_WEIGHT, VITE_APP_API, VITE_APP_ENV, VITE_APP_BASE } = env;
  // 判断是打生产环境包
  const isProd = VITE_APP_ENV === 'production';
  // 判断是打本地环境包
  const isLocal = VITE_APP_ENV === 'localhost';
  // 当前时间
  const currentTimeVersion = new Date().getTime();
  let plugins = [createVitePlugins(env, command === 'build')];
  if (!isLocal) {
    plugins = [
      ...plugins,
      versionUpdatePlugin({
        version: currentTimeVersion,
      }),
    ];
  }

  const proxyObj = {
    [VITE_APP_API]: {
      target: VITE_APP_BASE_URL,
      //target: 'https://saber3.bladex.cn/api',
      changeOrigin: true,
      rewrite: path => path.replace(VITE_APP_API, ''),
    },
    '/graphql/wiki': {
      target: 'https://wiki.eastwinbip.com/graphql',
      changeOrigin: true,
      rewrite: path => path.replace('/graphql/wiki', ''),
    },
    '/weight': {
      target: `${VITE_WEIGHT}/weight`,
      changeOrigin: true,
      rewrite: path => path.replace('^/weight', ''),
    },
    '/socket.io': {
      target: `${VITE_WEIGHT}/socket.io`,
      changeOrigin: true,
    },
    '/pdf-printing': {
      target: `https://www.eastwinbip.com/pdf-printing`,
      changeOrigin: true,
    },
  };

  console.log('proxyObj====>', proxyObj);

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
      proxy: {
        [VITE_APP_API]: {
          target: VITE_APP_BASE_URL,
          //target: 'https://saber3.bladex.cn/api',
          changeOrigin: true,
          rewrite: path => path.replace(VITE_APP_API, ''),
        },
        '/graphql/wiki': {
          target: 'https://wiki.eastwinbip.com/graphql',
          changeOrigin: true,
          rewrite: path => path.replace('/graphql/wiki', ''),
        },
        '/weight': {
          target: `${VITE_WEIGHT}/weight`,
          changeOrigin: true,
          rewrite: path => path.replace('^/weight', ''),
        },
        '/socket.io': {
          target: `${VITE_WEIGHT}/socket.io`,
          changeOrigin: true,
        },
        '/pdf-printing': {
          target: `https://www.eastwinbip.com/pdf-printing`,
          changeOrigin: true,
          rewrite: path => path.replace('/pdf-printing', ''),
        },
      },
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
      },
    },
    plugins,
    // 根据是否生产环境，动态设置压缩配置
    build: {
      target: 'esnext',
      minify: isProd ? 'terser' : 'esbuild', // 根据环境选择压缩工具
      rollupOptions: {
        output: {
          entryFileNames: '[name].[hash].js', // 入口文件带 hash
          chunkFileNames: chunkInfo => {
            if (chunkInfo.name === 'vendor') {
              return `vendor-${updateVendorCache(mode)}.js`;
            } else {
              return 'chunks/[name].[hash].js';
            }
          },
          assetFileNames: 'assets/[name].[hash].[ext]', // 静态资源文件带 hash
          manualChunks: id => {
            if (id.includes('node_modules')) {
              return 'vendor'; // vendor.js 不带 hash
            }
          },
        },
      },
      outDir: `${dayjs().format('YYYY-MM-DD-HH-mm')}-${VITE_APP_ENV}-dist`,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // additionalData: `@use './root.scss';`,
        },
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  });
};
