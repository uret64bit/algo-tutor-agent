import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Lock, CheckCircle2, Circle } from 'lucide-react'

const KnowledgeTree: React.FC = () => {
  const categories = [
    {
      name: '基础数据结构',
      progress: 80,
      points: [
        { id: 1, name: '数组与链表', status: 'mastered', difficulty: 1 },
        { id: 2, name: '栈与队列', status: 'mastered', difficulty: 1 },
        { id: 3, name: '哈希表', status: 'learning', difficulty: 2 },
        { id: 4, name: '二叉树', status: 'locked', difficulty: 2 },
      ],
    },
    {
      name: '算法基础',
      progress: 50,
      points: [
        { id: 5, name: '二分查找', status: 'mastered', difficulty: 2 },
        { id: 6, name: '排序算法', status: 'learning', difficulty: 2 },
        { id: 7, name: '双指针', status: 'learning', difficulty: 2 },
        { id: 8, name: '滑动窗口', status: 'locked', difficulty: 3 },
      ],
    },
    {
      name: '动态规划',
      progress: 0,
      points: [
        { id: 9, name: 'DP 入门', status: 'locked', difficulty: 3 },
        { id: 10, name: '背包问题', status: 'locked', difficulty: 4 },
        { id: 11, name: '区间 DP', status: 'locked', difficulty: 4 },
        { id: 12, name: '状压 DP', status: 'locked', difficulty: 5 },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'learning':
        return <Circle className="text-blue-500" size={20} />
      case 'locked':
        return <Lock className="text-gray-400" size={20} />
      default:
        return <Circle className="text-gray-300" size={20} />
    }
  }

  const getDifficultyColor = (diff: number) => {
    const colors = [
      '',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700',
    ]
    return colors[diff]
  }

  const getDifficultyLabel = (diff: number) => {
    const labels = ['', '入门', '简单', '中等', '困难', '地狱']
    return labels[diff]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">知识点图谱</h1>
        <p className="text-gray-600 mt-2">按照学习路径，循序渐进掌握算法知识</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">学习进度</h2>
            <p className="text-gray-500 text-sm mt-1">已掌握 12/48 个知识点</p>
          </div>
          <div className="text-3xl font-bold text-blue-600">25%</div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: '25%' }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <span className="text-sm text-gray-500">{category.progress}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${category.progress}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {category.points.map((point) => (
                <Link
                  key={point.id}
                  to={point.status !== 'locked' ? `/knowledge/${point.id}` : '#'}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    point.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => point.status === 'locked' && e.preventDefault()}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(point.status)}
                    <div>
                      <p className="font-medium text-gray-900">{point.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getDifficultyColor(point.difficulty)}`}
                    >
                      {getDifficultyLabel(point.difficulty)}
                    </span>
                    {point.status !== 'locked' && (
                      <ChevronRight className="text-gray-400" size={20} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KnowledgeTree
