import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

const ProblemList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const problems = [
    { id: 1, title: '两数之和', difficulty: 1, acceptance: 52.3, tags: ['数组', '哈希表'] },
    { id: 2, title: '两数相加', difficulty: 2, acceptance: 41.8, tags: ['链表', '数学'] },
    {
      id: 3,
      title: '无重复字符的最长子串',
      difficulty: 2,
      acceptance: 38.9,
      tags: ['哈希表', '字符串', '滑动窗口'],
    },
    {
      id: 4,
      title: '寻找两个正序数组的中位数',
      difficulty: 4,
      acceptance: 41.2,
      tags: ['数组', '二分查找', '分治'],
    },
    { id: 5, title: '最长回文子串', difficulty: 2, acceptance: 36.8, tags: ['字符串', '动态规划'] },
    { id: 6, title: 'N 字形变换', difficulty: 2, acceptance: 51.5, tags: ['字符串'] },
    { id: 7, title: '整数反转', difficulty: 2, acceptance: 35.2, tags: ['数学'] },
    { id: 8, title: '字符串转换整数 (atoi)', difficulty: 2, acceptance: 22.1, tags: ['字符串'] },
  ]

  const getDifficultyStyle = (diff: number) => {
    const styles = [
      '',
      'text-green-600 bg-green-50',
      'text-blue-600 bg-blue-50',
      'text-yellow-600 bg-yellow-50',
      'text-orange-600 bg-orange-50',
      'text-red-600 bg-red-50',
    ]
    return styles[diff]
  }

  const getDifficultyLabel = (diff: number) => {
    const labels = ['', '简单', '简单', '中等', '困难', '地狱']
    return labels[diff]
  }

  const filteredProblems = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (difficulty === null || p.difficulty === difficulty)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">题库</h1>
        <p className="text-gray-600 mt-2">按知识点和难度筛选题目，开始练习</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索题目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <span className="flex items-center text-sm text-gray-500">
              <Filter size={16} className="mr-1" />
              难度:
            </span>
            {[null, 1, 2, 3, 4].map((d) => (
              <button
                key={d ?? 'all'}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  difficulty === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d === null ? '全部' : getDifficultyLabel(d)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">状态</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">题目</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-24">难度</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-28">通过率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProblems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="w-5 h-5 block rounded-full border-2 border-gray-200" />
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {problem.id}. {problem.title}
                  </Link>
                  <div className="flex gap-1 mt-1">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-sm rounded ${getDifficultyStyle(problem.difficulty)}`}
                  >
                    {getDifficultyLabel(problem.difficulty)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{problem.acceptance}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">共 {filteredProblems.length} 道题</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm">{page}</span>
            <button onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemList
