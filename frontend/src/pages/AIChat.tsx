import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: { title: string; source: string }[]
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '你好！我是你的算法教练 AI，有什么问题可以问我。比如：\n- 动态规划怎么入门？\n- 二分查找有什么注意事项？\n- 这道题的思路是什么？',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '这是一个很好的问题！动态规划（DP）是一种通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。核心思想是记住已经解决过的子问题的解，避免重复计算。\n\n入门建议：\n1. 从「爬楼梯」「斐波那契数列」等经典问题开始\n2. 理解「状态」和「状态转移方程」的概念\n3. 先练习「一维DP」，再学习「二维DP」',
        references: [
          { title: '动态规划入门讲义', source: '知识点：DP 入门' },
          { title: '爬楼梯题解', source: 'LeetCode 70' },
        ],
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = ['DP 怎么入门？', '二分查找模板', '什么是滑动窗口？', '递归和迭代的区别']

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI 问答</h1>
        <p className="text-gray-600 mt-2">有任何算法问题，随时问我</p>
      </div>

      <div className="flex-1 mt-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="text-white" size={20} />
                ) : (
                  <Bot className="text-white" size={20} />
                )}
              </div>
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-md'
                      : 'bg-gray-100 text-gray-900 rounded-tl-md'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">引用来源：</p>
                    {msg.references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer"
                      >
                        <BookOpen size={14} />
                        {ref.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-500 mb-2">常见问题：</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的问题..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChat
