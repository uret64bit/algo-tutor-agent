import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Star } from 'lucide-react'

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)

  const solutionCode = `def two_sum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`

  const comments = [
    { id: 1, author: '学习者A', content: '讲得很清楚，感谢分享！', likes: 5, time: '2天前' },
    {
      id: 2,
      author: '算法小白',
      content: '请问一下为什么要用哈希表？暴力解法不行吗？',
      likes: 2,
      time: '1天前',
    },
    {
      id: 3,
      author: '算法大神',
      content: '回复 @算法小白：暴力是 O(n²)，哈希表优化到 O(n)，大数据量下差距很大',
      likes: 8,
      time: '1天前',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/discussions" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
              <Star size={12} />
              精选题解
            </span>
            <Link to="/problems/1" className="text-sm text-blue-600 hover:underline">
              1. 两数之和
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">哈希表 O(n) 解法，清晰易懂</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
            算
          </div>
          <div>
            <p className="font-medium text-gray-900">算法大神</p>
            <p className="text-sm text-gray-500">3天前 · Python</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              liked ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp size={18} />
            {liked ? '129' : '128'}
          </button>
        </div>
      </div>

      <article className="prose max-w-none">
        <h2>解题思路</h2>
        <p>
          这道题最容易想到的是暴力解法：两层循环枚举两个数，看它们的和是否等于
          target。但这样时间复杂度是 O(n²)，效率不高。
        </p>
        <p>我们需要一种方法可以快速查找「某个数是否存在」，哈希表正好可以在 O(1) 时间完成查找。</p>

        <h3>算法步骤</h3>
        <ol>
          <li>创建一个哈希表，存储已遍历的数字和它们的索引</li>
          <li>遍历数组，对于当前数字 num，计算 complement = target - num</li>
          <li>检查 complement 是否在哈希表中，如果在就找到答案了</li>
          <li>如果不在，把当前数字和索引加入哈希表，继续遍历</li>
        </ol>

        <h2>代码实现</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{solutionCode}</code>
        </pre>

        <h2>复杂度分析</h2>
        <ul>
          <li>
            <strong>时间复杂度：</strong>O(n)，只需要遍历一次数组
          </li>
          <li>
            <strong>空间复杂度：</strong>O(n)，需要哈希表存储 n 个元素
          </li>
        </ul>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Send size={16} />
                发表评论
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                {c.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{c.author}</span>
                  <span className="text-sm text-gray-400">{c.time}</span>
                </div>
                <p className="text-gray-700">{c.content}</p>
                <button className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-blue-600">
                  <ThumbsUp size={14} />
                  {c.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SolutionDetail
