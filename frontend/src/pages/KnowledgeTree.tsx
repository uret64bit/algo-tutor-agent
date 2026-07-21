import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { knowledgeApi } from '../utils/api'
import type { KnowledgePoint } from '../types'

interface KnowledgeNode extends KnowledgePoint {
  children: KnowledgeNode[]
}

const KnowledgeTree: React.FC = () => {
  const [tree, setTree] = useState<KnowledgeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    knowledgeApi
      .getTree()
      .then((resp) => {
        if (cancelled) return
        const items = resp.data as KnowledgePoint[]
        const byId = new Map<string, KnowledgeNode>()
        items.forEach((kp) => byId.set(kp.id, { ...kp, children: [] }))
        const roots: KnowledgeNode[] = []
        byId.forEach((node) => {
          if (node.parent_id && byId.has(node.parent_id)) {
            byId.get(node.parent_id)!.children.push(node)
          } else {
            roots.push(node)
          }
        })
        // 按字母顺序稳定排序，便于视觉对齐
        const sortRec = (nodes: KnowledgeNode[]) => {
          nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
          nodes.forEach((n) => sortRec(n.children))
        }
        sortRec(roots)
        setTree(roots)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : '加载知识点失败'
        setError(msg)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'hard':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy':
        return '简单'
      case 'medium':
        return '中等'
      case 'hard':
        return '困难'
      default:
        return diff
    }
  }

  const renderNode = (node: KnowledgeNode, depth = 0) => (
    <div key={node.id}>
      <Link
        to={`/knowledge/${node.id}`}
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <div>
            <p className="font-medium text-gray-900">{node.name}</p>
            {node.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{node.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(node.difficulty)}`}>
            {getDifficultyLabel(node.difficulty)}
          </span>
          <ChevronRight className="text-gray-400" size={20} />
        </div>
      </Link>
      {node.children.length > 0 && (
        <div className="divide-y divide-gray-100">
          {node.children.map((c) => renderNode(c, depth + 1))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">知识点图谱</h1>
        <p className="text-gray-600 mt-2">按照学习路径，循序渐进掌握算法知识</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          加载中...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">加载知识点失败</p>
            <p className="text-sm mt-1 text-red-600">{error}</p>
            <p className="text-xs mt-2 text-red-500">
              提示：确认后端服务已启动且 <code>/api/v1/knowledge/</code> 路由可用。
            </p>
          </div>
        </div>
      ) : tree.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
          暂无知识点数据
        </div>
      ) : (
        <div className="space-y-6">
          {tree.map((root) => (
            <div
              key={root.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{root.name}</h3>
                {root.description && (
                  <p className="text-sm text-gray-500 mt-1">{root.description}</p>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {root.children.length > 0
                  ? root.children.map((c) => renderNode(c, 1))
                  : renderNode(root, 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default KnowledgeTree
