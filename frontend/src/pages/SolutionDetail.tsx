import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Star, AlertCircle, Loader2 } from 'lucide-react'
import { discussionApi } from '../utils/api'
import type { Solution, Comment } from '../types'

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [solution, setSolution] = useState<Solution | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    Promise.all([discussionApi.getSolutionById(id), discussionApi.getComments(id)])
      .then(([solResp, cmtResp]) => {
        if (cancelled) return
        const sol = solResp.data as Solution
        setSolution(sol)
        setLikeCount(sol.likes)
        setComments(cmtResp.data as Comment[])
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载题解失败')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  const handleLike = async () => {
    if (!solution || liked) return
    // 乐观更新
    setLiked(true)
    setLikeCount((c) => c + 1)
    try {
      await discussionApi.likeSolution(solution.id)
    } catch {
      // 回滚
      setLiked(false)
      setLikeCount((c) => c - 1)
    }
  }

  const handleSubmitComment = async () => {
    if (!solution || !comment.trim() || submittingComment) return
    setSubmittingComment(true)
    try {
      const resp = await discussionApi.createComment(solution.id, comment.trim())
      setComments((prev) => [...prev, resp.data as Comment])
      setComment('')
    } catch {
      // 评论失败时静默，避免误伤用户输入。后端实现后会暴露真实错误。
    } finally {
      setSubmittingComment(false)
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

  if (error || !solution) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/discussions" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">题解详情</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-3 text-yellow-800">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">题解暂不可用</p>
            <p className="mt-1 text-yellow-700">
              后端题解 API（Task 15）尚未实现。待 Role B 完成后此页面将自动展示真实数据。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/discussions" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {solution.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                <Star size={12} />
                精选
              </span>
            )}
            <Link
              to={`/problems/${solution.problem_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              题目 {solution.problem_id.slice(0, 8)}…
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{solution.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
            {solution.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{solution.user.username}</p>
            <p className="text-sm text-gray-500">
              {new Date(solution.created_at).toLocaleString()} · {solution.language}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              liked
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
            }`}
          >
            <ThumbsUp size={18} />
            {likeCount}
          </button>
        </div>
      </div>

      <article className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {solution.content}
      </article>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          评论 ({comments.length})
        </h3>

        <div className="flex gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium flex-shrink-0">
            U
          </div>
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下你的评论..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim() || submittingComment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                <Send size={16} />
                {submittingComment ? '提交中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>

        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">暂无评论，来发表第一条吧</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                  {c.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{c.user.username}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  <button className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-blue-600">
                    <ThumbsUp size={14} />
                    {c.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SolutionDetail
