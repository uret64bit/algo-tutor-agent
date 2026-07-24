import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Monaco Editor: 使用本地打包的 monaco-editor，避免从 CDN 加载。
// @monaco-editor/react 默认从 jsdelivr CDN 拉取 monaco 核心，国内访问不稳定。
// 1) 注入本地 monaco-editor 实例
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
loader.config({ monaco })

// 2) 配置本地 worker 入口，Vite 会自动打包为独立 chunk
// 注意：monaco-editor@0.56 的 exports 字段限制了子路径访问，
// 这里通过 new URL(..., import.meta.url) 绕过 exports 解析，
// Vite 会在构建时把 worker 打包为独立 chunk。
const workerUrl = (p: string) =>
  new URL(`../node_modules/monaco-editor/esm/vs/${p}.js`, import.meta.url)

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    const map: Record<string, string> = {
      json: 'language/json/json.worker',
      css: 'language/css/css.worker',
      scss: 'language/css/css.worker',
      less: 'language/css/css.worker',
      html: 'language/html/html.worker',
      handlebars: 'language/html/html.worker',
      razor: 'language/html/html.worker',
      typescript: 'language/typescript/ts.worker',
      javascript: 'language/typescript/ts.worker',
    }
    const path = map[label] ?? 'editor/editor.worker'
    return new Worker(workerUrl(path), { type: 'module' })
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
