import React, { useState } from 'react'
import { RefreshCw, Clock, BookOpen, Check, X, ChevronRight } from 'lucide-react'

const Review: React.FC = () => {
  const [reviewItems, setReviewItems] = useState([
    { id: 1, name: '哈希表', stage: 2, dueIn: '今天', type: 'knowledge', completed: false },
    { id: 2, name: '两数之和', stage: 1, dueIn: '今天', type: 'problem', completed: false },
    { id: 3, name: '双指针技巧', stage: 4, dueIn: '明天', type: 'knowledge', completed: false },
  ])

  const [currentCard, setCurrentCard] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleReview = (id: number, correct: boolean) => {
    setReviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: true } : item))
    )
    setCurrentCard(null)
    setShowAnswer(false)
  }

  const todayItems = reviewItems.filter((item) => item.dueIn === '今天' && !item.completed)
  const upcomingItems = reviewItems.filter((item) => item.dueIn !== '今天' && !item.completed)
  const completedCount = reviewItems.filter((item) => item.completed).length

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
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">今日已完成</p>
            </div>
          </div>
        </div>
      </div>

      {currentCard !== null ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-4">
              <BookOpen size={14} />
              {reviewItems.find((i) => i.id === currentCard)?.type === 'knowledge'
                ? '知识点复习'
                : '题目复习'}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {reviewItems.find((i) => i.id === currentCard)?.name}
            </h2>
            <p className="text-gray-500 mt-2">回忆一下这个知识点的核心内容</p>
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
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>哈希表通过哈希函数实现 O(1) 查找</li>
                  <li>处理冲突：链地址法、开放寻址法</li>
                  <li>常见应用：两数之和、缓存设计</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(currentCard, false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  <X size={20} />
                  还需复习
                </button>
                <button
                  onClick={() => handleReview(currentCard, true)}
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
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === 'knowledge'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}
                      >
                        {item.type === 'knowledge' ? (
                          <BookOpen size={20} />
                        ) : (
                          <RefreshCw size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
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
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === 'knowledge'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}
                      >
                        {item.type === 'knowledge' ? (
                          <BookOpen size={20} />
                        ) : (
                          <RefreshCw size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.dueIn} · 阶段 {item.stage}
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
