import vue from '@vitejs/plugin-vue'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  build: {
    outDir: 'docs'
  },
  plugins: [vue()]
}
