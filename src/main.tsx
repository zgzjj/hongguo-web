import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 局域网自建服务, 数据变化慢, 不必频繁重取
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// 生产构建挂在 /ui/ 下, 路由 basename 要跟着走
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const container = document.getElementById('root')
if (!container) throw new Error('找不到 #root 挂载点')

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
