import Vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig, loadEnv } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_')
  const devPort = Number(env.VITE_DEV_SERVER_PORT) || 55_120

  return {
    plugins: [
      Vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
        styles: {
          configFile: 'src/styles/settings.scss',
        },
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic'],
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
      extensions: [
        '.js',
        '.json',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.vue',
      ],
    },
    server: {
      port: devPort,
      proxy: {
        // http2keyboard API
        '^/scanners': {
          target: 'http://localhost:55110',
          changeOrigin: true,
        },
        '^/polling': {
          target: 'http://localhost:55110',
          changeOrigin: true,
        },
        // Scanner2HTTP API
        '^/scanner2http': {
          target: 'http://localhost:55100',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/scanner2http/, ''),
        },
      },
    },
  }
})
