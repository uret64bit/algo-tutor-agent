import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, Trophy, Target, TrendingUp, Calendar } from 'lucide-react'

const Progress: React.FC = () => {
  const radarData = [
    { subject: '数组', A: 85, fullMark: 100 },
    { subject: '链表', A: 70, fullMark: 100 },
    { subject: '哈希表', A: 90, fullMark: 100 },
    { subject: '二叉树', A: 60, fullMark: 100 },
    { subject: '动态规划', A: 30, fullMark: 100 },
    { subject: '图论', A: 20, fullMark: 100 },
  ]

  const stats = [
    {
      label: '已掌握知识点',
      value: '12',
      total: '48',
      icon: Target,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: '通过题目',
      value: '36',
      total: '200+',
      icon: Trophy,
      color: 'text-blue-600 bg-blue-100',
    },
    { label: '通过率', value: '68.5%', icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    {
      label: '连续打卡',
      value: '7',
      total: '天',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-100',
    },
  ]

  const weakPoints = [
    { name: '动态规划', rate: 30, suggestion: '建议复习状态转移方程相关知识' },
    { name: '图论', rate: 20, suggestion: '从BFS/DFS基础开始学习' },
    { name: '贪心算法', rate: 45, suggestion: '多练习区间调度类问题' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">学习进度</h1>
        <p className="text-gray-600 mt-2">查看你的学习数据和薄弱点</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon size={24} />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
                {stat.total && (
                  <span className="text-base font-normal text-gray-500">/{stat.total}</span>
                )}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">知识点掌握度</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="掌握度"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="text-red-500" size={20} />
            薄弱知识点
          </h2>
          <div className="space-y-4">
            {weakPoints.map((point) => (
              <div key={point.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{point.name}</span>
                  <span className="text-sm text-gray-500">{point.rate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${point.rate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{point.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">最近提交</h2>
        <div className="space-y-3">
          {[
            { id: 1, title: '两数之和', status: 'AC', time: '2小时前', lang: 'Python' },
            { id: 2, title: '反转链表', status: 'AC', time: '昨天', lang: 'C++' },
            { id: 3, title: '最长回文子串', status: 'WA', time: '昨天', lang: 'Python' },
            { id: 4, title: '合并两个有序数组', status: 'AC', time: '2天前', lang: 'Java' },
          ].map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    submission.status === 'AC' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-medium text-gray-900">{submission.title}</span>
                <span className="text-sm text-gray-500">{submission.lang}</span>
              </div>
              <span className="text-sm text-gray-500">{submission.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Progress
