import React from 'react'
import { Link } from 'react-router-dom'
import { BookX, RotateCcw, ChevronRight, AlertCircle } from 'lucide-react'

const WrongAnswers: React.FC = () => {
  const wrongAnswers = [
    {
      id: 1,
      title: '最长回文子串',
      errorType: 'WA',
      errorCount: 3,
      lastAttempt: '昨天',
      tags: ['字符串', '动态规划'],
    },
    {
      id: 2,
      title: '接雨水',
      errorType: 'TLE',
      errorCount: 2,
      lastAttempt: '3天前',
      tags: ['栈', '双指针', '动态规划'],
    },
    {
      id: 3,
      title: 'LRU 缓存',
      errorType: 'RE',
      errorCount: 1,
      lastAttempt: '5天前',
      tags: ['设计', '哈希表', '链表'],
    },
    {
      id: 4,
      title: '合并K个升序链表',
      errorType: 'WA',
      errorCount: 4,
      lastAttempt: '1周前',
      tags: ['链表', '分治', '堆'],
    },
  ]

  const similarProblems = [
    { id: 101, title: '最长公共子序列', difficulty: '中等' },
    { id: 102, title: '最长递增子序列', difficulty: '中等' },
  ]

  const getErrorStyle = (type: string) => {
    switch (type) {
      case 'WA':
        return 'bg-red-100 text-red-700'
      case 'TLE':
        return 'bg-orange-100 text-orange-700'
      case 'RE':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getErrorText = (type: string) => {
    switch (type) {
      case 'WA':
        return '答案错误'
      case 'TLE':
        return '超时'
      case 'RE':
        return '运行错误'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">错题本</h1>
        <p className="text-gray-600 mt-2">回顾错题，查漏补缺，避免重复犯错</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <BookX className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-500">错题总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <RotateCcw className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">待复习</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500">已订正</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">错题列表</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {wrongAnswers.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/problems/${item.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                    >
                      {item.id}. {item.title}
                    </Link>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getErrorStyle(item.errorType)}`}
                    >
                      {getErrorText(item.errorType)}
                    </span>
                    <span className="text-sm text-gray-500">错误 {item.errorCount} 次</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">上次尝试：{item.lastAttempt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    重新做题
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">📚 推荐同类题：</p>
                <div className="flex gap-2 flex-wrap">
                  {similarProblems.map((p) => (
                    <Link
                      key={p.id}
                      to={`/problems/${p.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {p.title}
                      <span className="text-xs text-gray-500">({p.difficulty})</span>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WrongAnswers
