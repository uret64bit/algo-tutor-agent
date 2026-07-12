import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, FileText, GraduationCap, Copy, Code2 } from 'lucide-react'

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1)

  const levels = [
    { level: 1 as const, label: '知识卡片', icon: BookOpen, desc: '快速入门' },
    { level: 2 as const, label: '标准讲义', icon: FileText, desc: '系统学习' },
    { level: 3 as const, label: '深度专题', icon: GraduationCap, desc: '进阶提升' },
  ]

  const templateCode = `def two_sum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/knowledge" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">哈希表</h1>
          <p className="text-gray-500">基础数据结构 · 简单</p>
        </div>
      </div>

      <div className="flex gap-2">
        {levels.map((l) => {
          const Icon = l.icon
          return (
            <button
              key={l.level}
              onClick={() => setActiveLevel(l.level)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                activeLevel === l.level
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon size={18} />
              <div className="text-left">
                <p className="font-medium text-sm">{l.label}</p>
                <p
                  className={`text-xs ${activeLevel === l.level ? 'text-blue-100' : 'text-gray-500'}`}
                >
                  {l.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {activeLevel === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">什么是哈希表？</h2>
            <p className="text-gray-700 leading-relaxed">
              哈希表（Hash
              Table）是一种通过键（Key）直接访问内存存储位置的数据结构。它通过哈希函数将键映射到数组的一个索引，从而实现
              O(1) 时间复杂度的查找、插入和删除。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="font-medium text-blue-900">核心思想</p>
              <p className="text-blue-700 text-sm mt-1">
                空间换时间 —— 利用数组的快速随机访问特性，通过哈希函数建立键到索引的映射。
              </p>
            </div>
          </div>
        )}

        {activeLevel === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">标准讲义：哈希表</h2>
            <section className="space-y-3">
              <h3 className="text-lg font-medium">1. 哈希函数</h3>
              <p className="text-gray-700 leading-relaxed">
                哈希函数的设计是哈希表的核心。一个好的哈希函数应该满足：计算速度快、分布均匀、冲突少。
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-medium">2. 冲突解决</h3>
              <p className="text-gray-700 leading-relaxed">
                当两个不同的键映射到同一个索引时，就会发生冲突。常见的解决方法有：链地址法、开放寻址法。
              </p>
            </section>
          </div>
        )}

        {activeLevel === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">深度专题</h2>
            <p className="text-gray-700">深入探讨哈希表的高级应用和性能分析...</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Code2 size={20} className="text-blue-600" />
            模板代码
          </h3>
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            <Copy size={16} />
            复制
          </button>
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{templateCode}</code>
        </pre>
      </div>

      <div className="flex justify-between">
        <Link
          to="/knowledge"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          返回图谱
        </Link>
        <Link
          to="/problems?kp=1"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          去做练习题 →
        </Link>
      </div>
    </div>
  )
}

export default KnowledgeDetail
