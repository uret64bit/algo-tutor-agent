import React from 'react'
import { Bell, Check, CheckCheck, BookOpen, RefreshCw, AlertCircle } from 'lucide-react'

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'review',
      title: '复习提醒',
      content: '「哈希表」知识点已到复习时间，快来巩固一下吧！',
      time: '10分钟前',
      isRead: false,
    },
    {
      id: 2,
      type: 'push',
      title: '学习路径推荐',
      content: '你已掌握「数组与链表」，建议开始学习「栈与队列」',
      time: '2小时前',
      isRead: false,
    },
    {
      id: 3,
      type: 'review',
      title: '复习提醒',
      content: '你有一道错题「最长回文子串」等待复习',
      time: '昨天',
      isRead: true,
    },
    {
      id: 4,
      type: 'system',
      title: '新题上架',
      content: '动态规划专题新增 5 道题目，快来挑战吧！',
      time: '3天前',
      isRead: true,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <RefreshCw className="text-orange-600" size={20} />
      case 'push':
        return <BookOpen className="text-blue-600" size={20} />
      default:
        return <AlertCircle className="text-gray-600" size={20} />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'review':
        return 'bg-orange-100'
      case 'push':
        return 'bg-blue-100'
      default:
        return 'bg-gray-100'
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-600 mt-2">查看系统通知和学习提醒</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <CheckCheck size={18} />
          全部已读
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            共 {notifications.length} 条消息，{unreadCount} 条未读
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}
              >
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  {!notification.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
                <p className="text-gray-600 text-sm">{notification.content}</p>
                <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
              </div>
              {!notification.isRead && (
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors self-start">
                  <Check size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notifications
