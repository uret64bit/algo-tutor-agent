import React, { useEffect, useState } from 'react'
import { RefreshCw, Clock, BookOpen, Check, X, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { reviewApi } from '../utils/api'
import type { ReviewItem } from '../types'

const Review: React.FC = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCard, setCurrentCard] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    let cancelled = false
    reviewApi
      .getList()
      .then((resp) => {
        if (!cancelled) setReviewItems(resp.data as ReviewItem[])
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载复习列表失败')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const handleReview = async (id: string, correct: boolean) => {
    // 乐观更新：先关闭卡片，再后台提交
    const original = reviewItems
    setReviewItems((prev) => prev.filter((item) => item.id !== id))
    setCurrentCard(null)
    setShowAnswer(false)
    try {
      await reviewApi.submitReview(id, correct)
    } catch {
      // 提交失败时回滚
      setReviewItems(original)
      setError('复习结果提交失败，请稍后重试')
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">复习提醒</h1>
          <p className="text-gray-600 mt-2">根据艾宾浩斯遗忘曲线，按时复习巩固记忆</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-3 text-yellow-800">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">复习数据暂不可用</p>
            <p className="mt-1 text-yellow-700">
              后端复习 API（Task 13）尚未实现。待 Role B 完成 <code>/api/v1/review/list</code> 后此页面将自动展示真实数据。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const todayItems = reviewItems.filter((item) => {
    const due = new Date(item.next_review_date)
    const today = new Date()
    return due.toDateString() === today.toDateString()
  })
  const upcomingItems = reviewItems.filter((item) => {
    const due = new Date(item.next_review_date)
    const today = new Date()
    return due > today
  })
  const completedCount = reviewItems.length - todayItems.length - upcomingItems.length

  const currentItem = currentCard ? reviewItems.find((i) => i.id === currentCard) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">复习提醒</h1>
        <p className="text-gray-600 mt-2">根据艾宾浩斯遗忘曲线，按时复习巩固记忆</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayItems.length}</p>
              <p className="text-sm text-gray-500">今日待复习</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingItems.length}</p>
              <p className="text-sm text-gray-500">即将到期</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.max(0, completedCount)}</p>
              <p className="text-sm text-gray-500">已完成</p>
            </div>
          </div>
        </div>
      </div>

      {reviewItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          暂无待复习内容，请先学习一些知识点或做题
        </div>
      ) : currentItem ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-4">
              <BookOpen size={14} />
              {currentItem.problem ? '题目复习' : '知识点复习'}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentItem.problem?.title || currentItem.knowledge_point.name}
            </h2>
            <p className="text-gray-500 mt-2">复习阶段 {currentItem.stage}</p>
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
            >
              显示答案
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold mb-2">核心要点：</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentItem.knowledge_point.description || '请回顾该知识点的核心概念与典型例题。'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(currentItem.id, false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  <X size={20} />
                  还需复习
                </button>
                <button
                  onClick={() => handleReview(currentItem.id, true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                >
                  <Check size={20} />
                  记住了
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {todayItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-orange-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="text-orange-600" size={20} />
                  今日待复习
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {todayItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                        {item.problem ? <RefreshCw size={20} /> : <BookOpen size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.problem?.title || item.knowledge_point.name}
                        </p>
                        <p className="text-sm text-gray-500">复习阶段 {item.stage}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentCard(item.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      开始复习
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="text-gray-400" size={20} />
                  即将到期
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                        {item.problem ? <RefreshCw size={20} /> : <BookOpen size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.problem?.title || item.knowledge_point.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.next_review_date).toLocaleDateString()} · 阶段 {item.stage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Review
