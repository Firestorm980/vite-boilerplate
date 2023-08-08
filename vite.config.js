import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'

export default defineConfig(({ command, mode }) => {
  return {
    root: 'src',
    plugins: [eslint(), stylelint()],
    build: {
      outDir: '../dist'
    },
    define: {
      global: 'window' // Needed for PouchDB for some silly reason.
    }
  }
})
