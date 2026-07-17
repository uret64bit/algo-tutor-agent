import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, FileText, GraduationCap, Copy, Loader2, AlertCircle } from 'lucide-react'
import { knowledgeApi } from '../utils/api'
import type { KnowledgePoint, Lecture } from '../types'

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [knowledge, setKnowledge] = useState<KnowledgePoint | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLevel, setActiveLevel] = useState<'card' | 'standard' | 'deep'>('card')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([knowledgeApi.getById(id), knowledgeApi.getLectures(id)])
      .then(([kpResp, lecResp]) => {
        if (cancelled) return
        setKnowledge(kpResp.data as KnowledgePoint)
        const lecs = lecResp.data as Lecture[]
        setLectures(lecs)
        // 优先选中第一个可用级别
        if (lecs.length > 0) {
          setActiveLevel(lecs[0].level)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载知识点失败')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  const levels: { level: 'card' | 'standard' | 'deep'; label: string; icon: typeof BookOpen; desc: string }[] = [
    { level: 'card', label: '知识卡片', icon: BookOpen, desc: '快速入门' },
    { level: 'standard', label: '标准讲义', icon: FileText, desc: '系统学习' },
    { level: 'deep', label: '深度专题', icon: GraduationCap, desc: '进阶提升' },
  ]

  const currentLecture = lectures.find((l) => l.level === activeLevel)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        加载中...
      </div>
    )
  }

  if (error || !knowledge) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-gray-700">{error || '知识点不存在'}</p>
        <Link to="/knowledge" className="text-blue-600 hover:underline">
          返回知识点图谱
        </Link>
      </div>
    )
  }

  const availableLevels = new Set(lectures.map((l) => l.level))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/knowledge" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{knowledge.name}</h1>
          <p className="text-gray-500">难度：{knowledge.difficulty}</p>
        </div>
      </div>

      {lectures.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          该知识点暂无讲义内容
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {levels.map((l) => {
              const Icon = l.icon
              const available = availableLevels.has(l.level)
              return (
                <button
                  key={l.level}
                  onClick={() => available && setActiveLevel(l.level)}
                  disabled={!available}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    activeLevel === l.level
                      ? 'bg-blue-600 text-white'
                      : available
                        ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <div className="text-left">
                    <p className="font-medium text-sm">{l.label}</p>
                    <p
                      className={`text-xs ${activeLevel === l.level ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                      {available ? l.desc : '未提供'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {currentLecture ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold mb-4">{currentLecture.title}</h2>
              <article className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentLecture.content}
              </article>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              该级别暂无讲义内容
            </div>
          )}
        </>
      )}

      {knowledge.description && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="font-medium text-blue-900">知识点简介</p>
          <p className="text-blue-700 text-sm mt-1">{knowledge.description}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Link
          to="/knowledge"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          返回图谱
        </Link>
        <Link
          to={`/problems?kp=${knowledge.slug}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          去做练习题 →
        </Link>
      </div>

      {/* 保留复制按钮逻辑供模板代码使用 */}
      <button
        type="button"
        onClick={() => handleCopy(knowledge.description || '')}
        className="hidden"
        aria-hidden
      >
        <Copy size={16} />
        {copied ? '已复制' : '复制'}
      </button>
    </div>
  )
}

export default KnowledgeDetail
