import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Code2,
  BarChart3,
  RefreshCw,
  BookX,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const quickActions = [
    { path: '/problems', label: '开始刷题', icon: Code2, color: 'bg-blue-500' },
    { path: '/knowledge', label: '学习知识点', icon: BookOpen, color: 'bg-green-500' },
    { path: '/review', label: '今日复习', icon: RefreshCw, color: 'bg-orange-500' },
    { path: '/ai-chat', label: 'AI 问答', icon: MessageSquare, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来！</h1>
        <p className="text-gray-600 mt-2">今天也要加油练习算法哦 💪</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已掌握知识点</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">12/48</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">通过题目</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">36</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Code2 className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            <TrendingUp className="inline text-green-500" size={16} /> 本周 +7 题
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">错题本</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <BookX className="text-red-600" size={24} />
            </div>
          </div>
          <Link
            to="/wrong-answers"
            className="text-sm text-blue-600 hover:underline mt-4 inline-block"
          >
            去复习错题 →
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待复习</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="text-orange-600" size={24} />
            </div>
          </div>
          <Link to="/review" className="text-sm text-blue-600 hover:underline mt-4 inline-block">
            开始复习 →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.path}
                to={action.path}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <p className="font-medium text-gray-900">{action.label}</p>
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">学习路径</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">当前学习：动态规划入门</h3>
              <p className="text-gray-600 mt-1">已完成 3/5 个知识点，继续加油！</p>
              <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <Link
              to="/knowledge/3"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              继续学习
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">推荐题目</h2>
          <Link to="/problems" className="text-blue-600 hover:underline text-sm">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Link
              key={i}
              to={`/problems/${i}`}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900">两数之和</h3>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">简单</span>
              </div>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target
                的那两个整数。
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">数组</span>
                <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">哈希表</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
