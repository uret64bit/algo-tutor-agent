import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { problemsApi } from '../utils/api'
import type { Problem, ProblemListResponse } from '../types'

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const ProblemList: React.FC = () => {
  const [searchParams] = useSearchParams()
  const kpSlug = searchParams.get('kp') || undefined

  const [searchTerm, setSearchTerm] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ProblemListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 20

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params: {
      page: number
      page_size: number
      difficulty?: Difficulty
      search?: string
    } = { page, page_size: pageSize }
    if (difficulty) params.difficulty = difficulty
    if (searchTerm.trim()) params.search = searchTerm.trim()

    problemsApi
      .list(params)
      .then((resp) => {
        if (cancelled) return
        setData(resp.data as ProblemListResponse)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载题目列表失败')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [page, difficulty, searchTerm])

  const items = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 0
  const acceptance = (p: Problem) =>
    p.submit_count > 0 ? Math.round((p.accepted_count / p.submit_count) * 1000) / 10 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">题库</h1>
        <p className="text-gray-600 mt-2">
          按难度筛选题目，开始练习
          {kpSlug && <span className="ml-2 text-sm text-blue-600">· 关联知识点：{kpSlug}</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索题目..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="flex items-center text-sm text-gray-500">
              <Filter size={16} className="mr-1" />
              难度:
            </span>
            {([null, 'easy', 'medium', 'hard'] as (Difficulty | null)[]).map((d) => (
              <button
                key={d ?? 'all'}
                onClick={() => {
                  setDifficulty(d)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  difficulty === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d === null ? '全部' : DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">加载题目失败</p>
            <p className="text-sm mt-1 text-red-600">{error}</p>
            <p className="text-xs mt-2 text-red-500">
              提示：确认后端服务已启动且 <code>/api/v1/problems/</code> 路由可用。
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">题目</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-24">难度</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-28">
                  通过率
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin inline mr-2" size={20} />
                    加载中...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    暂无题目，换个筛选条件试试
                  </td>
                </tr>
              ) : (
                items.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="w-5 h-5 block rounded-full border-2 border-gray-200" />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {problem.title}
                      </Link>
                      {problem.knowledge_point_ids && problem.knowledge_point_ids.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {problem.knowledge_point_ids.slice(0, 3).map((kpId) => (
                            <span
                              key={kpId}
                              className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                            >
                              {kpId.slice(0, 8)}…
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          DIFFICULTY_STYLE[problem.difficulty] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {DIFFICULTY_LABEL[problem.difficulty] || problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{acceptance(problem)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              共 {total} 道题{totalPages > 0 ? ` · 第 ${page}/${totalPages} 页` : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-3 py-1 text-sm">{page}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProblemList
