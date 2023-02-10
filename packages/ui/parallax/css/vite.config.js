import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ command, mode }) => {
  return {
    root: 'src',
    plugins: [viteSingleFile()],
    build: {
      outDir: '../dist'
    }
  }
})
