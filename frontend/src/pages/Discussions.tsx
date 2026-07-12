import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Eye, Star, ChevronRight } from 'lucide-react'

const Discussions: React.FC = () => {
  const solutions = [
    {
      id: 1,
      problemTitle: '两数之和',
      problemId: 1,
      title: '哈希表 O(n) 解法，清晰易懂',
      author: { username: '算法大神', avatar: 'A' },
      language: 'Python',
      likes: 128,
      comments: 32,
      views: 2560,
      isFeatured: true,
      createdAt: '3天前',
    },
    {
      id: 2,
      problemTitle: '反转链表',
      problemId: 2,
      title: '递归+迭代双解法，附详细图解',
      author: { username: '链表大师', avatar: '链' },
      language: 'C++',
      likes: 89,
      comments: 15,
      views: 1890,
      isFeatured: true,
      createdAt: '5天前',
    },
    {
      id: 3,
      problemTitle: '最长回文子串',
      problemId: 5,
      title: 'Manacher 算法 O(n) 最优解',
      author: { username: 'DP专家', avatar: 'D' },
      language: 'Java',
      likes: 56,
      comments: 8,
      views: 1200,
      isFeatured: false,
      createdAt: '1周前',
    },
    {
      id: 4,
      problemTitle: '三数之和',
      problemId: 15,
      title: '排序+双指针，去重技巧详解',
      author: { username: '双指针选手', avatar: '双' },
      language: 'Python',
      likes: 42,
      comments: 12,
      views: 980,
      isFeatured: false,
      createdAt: '1周前',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">题解广场</h1>
        <p className="text-gray-600 mt-2">分享解题思路，学习优秀题解</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">全部</button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <Star className="inline mr-1" size={14} />
          精选题解
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Python
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          C++
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Java
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {solutions.map((solution) => (
            <Link
              key={solution.id}
              to={`/solutions/${solution.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {solution.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                        <Star size={12} />
                        精选
                      </span>
                    )}
                    <Link
                      to={`/problems/${solution.problemId}`}
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {solution.problemId}. {solution.problemTitle}
                    </Link>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-2">
                    {solution.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                        {solution.author.avatar}
                      </div>
                      <span>{solution.author.username}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {solution.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {solution.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {solution.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {solution.views}
                    </span>
                    <span>{solution.createdAt}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Discussions
