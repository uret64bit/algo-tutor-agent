import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Lightbulb,
  RotateCcw,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
} from 'lucide-react'
import Editor from '@monaco-editor/react'

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [code, setCode] = useState(`def two_sum(nums, target):
    # 在这里写你的代码
    pass`)
  const [language, setLanguage] = useState('python')
  const [isJudging, setIsJudging] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [hintLevel, setHintLevel] = useState(0)

  const hints = [
    '想想什么数据结构可以快速查找元素？',
    '哈希表可以在 O(1) 时间内查找，尝试用哈希表存储已遍历的数字。',
    '遍历数组，对于每个数字，检查 target - num 是否在哈希表中。如果存在，返回结果；否则将当前数字加入哈希表。',
  ]

  const handleSubmit = async () => {
    setIsJudging(true)
    setResult(null)
    setTimeout(() => {
      setResult({
        status: 'AC',
        time_used: 48,
        memory_used: 17.2,
        complexity_analysis: '时间复杂度 O(n)，空间复杂度 O(n)',
        code_review: '代码实现正确，使用了哈希表优化查找效率。可以考虑添加输入验证和异常处理。',
      })
      setIsJudging(false)
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AC':
        return 'text-green-600 bg-green-50'
      case 'WA':
        return 'text-red-600 bg-red-50'
      case 'TLE':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AC':
        return '通过 (Accepted)'
      case 'WA':
        return '答案错误 (Wrong Answer)'
      case 'TLE':
        return '超时 (Time Limit Exceeded)'
      case 'RE':
        return '运行错误 (Runtime Error)'
      default:
        return status
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] -m-8 flex flex-col">
      <div className="flex items-center gap-4 px-8 py-4 border-b border-gray-200 bg-white">
        <Link to="/problems" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">1. 两数之和</h1>
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">简单</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6 bg-white">
          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold">题目描述</h2>
            <p className="text-gray-700 mt-2">
              给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target
              的那两个整数，并返回它们的数组下标。
            </p>
            <p className="text-gray-700 mt-2">
              你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。
            </p>

            <h3 className="text-md font-semibold mt-6">示例 1：</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <strong>输入：</strong>nums = [2,7,11,15], target = 9
              </p>
              <p>
                <strong>输出：</strong>[0,1]
              </p>
              <p>
                <strong>解释：</strong>因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
              </p>
            </div>

            <h3 className="text-md font-semibold mt-6">提示：</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>
                2 {'<='} nums.length {'<='} 10^4
              </li>
              <li>
                -10^9 {'<='} nums[i] {'<='} 10^9
              </li>
              <li>
                -10^9 {'<='} target {'<='} 10^9
              </li>
              <li>只会存在一个有效答案</li>
            </ul>
          </div>

          {hintLevel > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold flex items-center gap-2 text-yellow-600">
                <Lightbulb size={18} />
                提示 (Level {hintLevel})
              </h3>
              <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">{hints[hintLevel - 1]}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            {hintLevel < 3 && (
              <button
                onClick={() => setHintLevel(hintLevel + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Lightbulb size={18} />
                {hintLevel === 0 ? '获取提示' : '下一层提示'}
              </button>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded border-none text-sm outline-none"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setCode('')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="重置代码"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={isJudging}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                <Send size={16} />
                {isJudging ? '判题中...' : '提交'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {result && (
            <div className="border-t border-gray-700 bg-gray-800 p-4 max-h-64 overflow-y-auto">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStatusColor(result.status)} mb-4`}
              >
                {result.status === 'AC' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span className="font-medium">{getStatusText(result.status)}</span>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={16} />
                  <span>{result.time_used} ms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Cpu size={16} />
                  <span>{result.memory_used} MB</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">复杂度分析</p>
                  <p className="text-gray-200 text-sm">{result.complexity_analysis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">代码 Review</p>
                  <p className="text-gray-200 text-sm">{result.code_review}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail
