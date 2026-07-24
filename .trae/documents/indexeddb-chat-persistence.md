# IndexedDB 聊天记录持久化

## 目标
将 AI 问答记录从 React useState 内存持久化到 IndexedDB（Dexie.js），解决切走页面后历史清空问题。同时预留表结构供后续知识图谱/错题本/复习系统复用。

## 当前状态分析
- [AIChat.tsx:16-23](file:///d:/salgo-tutor-agent/frontend/src/pages/AIChat.tsx#L16-L23) `messages` 仅用 useState，组件卸载即丢失
- 后端不存对话，history 参数只是临时传给 Agent
- 已有 zustand（[package.json:24](file:///d:/salgo-tutor-agent/frontend/package.json#L24)）和 [stores/authStore.ts](file:///d:/salgo-tutor-agent/frontend/src/stores/authStore.ts)
- [types/index.ts:72-78](file:///d:/salgo-tutor-agent/frontend/src/types/index.ts#L72-L78) 已有 `ChatMessage` 类型但 AIChat.tsx 未用，自己定义了 `Message` 接口

## 设计

### 数据库结构（Dexie）
数据库名：`algo-tutor-db`，版本 1

| 表 | 主键 | 索引 | 用途 |
|---|---|---|---|
| `conversations` | `id` | `user_id`, `updated_at` | 会话（一个用户可有多个会话） |
| `messages` | `id` | `conversation_id`, `user_id`, `created_at` | 单条消息 |
| `wrong_answers` | `id` | `user_id`, `created_at` | 预留给错题本（Task 11） |
| `review_items` | `id` | `user_id`, `next_review_date` | 预留给复习系统（Task 13） |

会话按 user_id 区分，未登录时用 `local` 作为 user_id，保证 MVP 不强依赖登录。

### 文件变更

#### 新增文件

**1. `frontend/src/db/db.ts`** — Dexie 数据库定义
- 定义 `AppDB` extends Dexie
- 注册 4 个表
- 导出 `db` 单例

**2. `frontend/src/stores/chatStore.ts`** — zustand + dexie 封装
- State：`conversations`, `currentConversationId`, `messages`, `isLoading`, `error`
- Actions：
  - `loadConversations(userId)` — 加载会话列表
  - `createConversation(userId)` — 新建会话
  - `selectConversation(id)` — 切换会话，加载该会话的消息
  - `addMessage(userId, conversationId, role, content, references?)` — 追加消息并更新会话 updated_at
  - `deleteConversation(id)` — 删除会话及其消息（级联）
  - `clearAll(userId)` — 清空该用户所有数据
- 加载策略：
  - 组件挂载时调用 `loadConversations(currentUserId)`
  - 若无会话则自动创建一个
  - 选中会话时从 messages 表按 created_at 排序加载

#### 修改文件

**3. `frontend/src/pages/AIChat.tsx`** — 改造为使用 chatStore
- 移除 `useState<Message[]>` 直接 state
- 用 `useChatStore` 读取 messages/conversations/currentConversationId
- `useEffect` 挂载时加载会话
- `send()` 改为先 `addMessage(user)` 持久化，再调 API，成功后 `addMessage(assistant)` 持久化
- 失败时删除刚插入的 user message（避免脏数据）
- 保留 `buildHistory` 逻辑，从 store 的 messages 构建
- 保留 `MAX_HISTORY=20` 限制传给后端的条数（但本地全量存储）
- 保留重试逻辑，基于 store 的 messages 计算 cleanedMessages
- 新增"新建会话"按钮（可选，第一版可不加，自动单会话）
- 新增"清空会话"按钮（可选）

**4. `frontend/src/types/index.ts`** — 统一类型
- 移除 AIChat.tsx 里自有的 `Message` 接口
- 改用 `ChatMessage`（已有，第 72-78 行）
- 给 `ChatMessage` 加 `tool_calls?: AgentToolCall[]` 字段（用于记录 Agent 本轮用了哪些工具，便于后续复盘）
- 新增 `Conversation` 接口

**5. `frontend/package.json`** — 加 dexie 依赖
```json
"dexie": "^4.0.10"
```

## Assumptions & Decisions
- **库选择**：Dexie.js（用户选定）
- **未登录用户处理**：user_id 用 `'local'` 字符串，不强依赖认证系统
- **会话管理**：第一版自动单会话（每个用户一个会话，自动加载或创建），不暴露会话切换 UI。预留多会话能力，后续可加 UI
- **历史传给后端**：仍只传最近 20 条（MAX_HISTORY 不变），但本地全量持久化
- **错误恢复**：发送失败时移除已插入的用户消息，保持数据一致性
- **不做后端改动**：纯前端持久化，不动 backend/
- **预留表**：wrong_answers、review_items 表结构提前定义但不填充，后续 Task 11/13 实现时直接用
- **数据清理**：logout 时清当前用户数据？不，保留 IndexedDB 数据，下次登录同一账号仍可见。logout 不清库

## Verification
1. `cd frontend && npm install` — 装 dexie
2. `cd frontend && npm run typecheck` — 类型检查通过
3. `cd frontend && npm run lint` — 0 errors
4. `cd frontend && npm run build` — 构建通过
5. 手动验证（需运行）：
   - 打开 AIChat 发消息
   - 切到别的页面再切回来
   - 历史消息仍在
   - 刷新浏览器历史仍在
   - 清空浏览器数据后消失（符合预期）

## 不做
- 不加会话切换 UI（第一版自动单会话）
- 不做多设备同步（IndexedDB 是单设备的）
- 不动后端
- 不做数据导出/导入
