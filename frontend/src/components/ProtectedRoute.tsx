import React from 'react'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// 开发模式：auth 后端还没实现时，自动注入假用户绕过登录守卫。
// 待 B 同学完成 auth 模块（backend/app/routers/auth.py）后删除此 hack。
const DEV_FAKE_USER = {
  id: 'dev-0001',
  email: 'dev@algo-tutor.local',
  username: 'dev_admin',
  role: 'admin' as const,
  created_at: new Date().toISOString(),
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    // 注入假 token + 假用户，让 store 认为已登录
    localStorage.setItem('token', 'dev-fake-token')
    localStorage.setItem('user', JSON.stringify(DEV_FAKE_USER))
    useAuthStore.setState({
      user: DEV_FAKE_USER,
      token: 'dev-fake-token',
      isAuthenticated: true,
    })
  }

  return <>{children}</>
}

export default ProtectedRoute
