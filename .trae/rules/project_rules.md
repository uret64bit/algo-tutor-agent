# Project Rules

## 技术栈
- 前端: React 18 + TypeScript + Vite + TailwindCSS
- 后端: Python 3.12 + FastAPI + PostgreSQL + SQLAlchemy 2.0 (async)
- 详见: project_memory.md

## 多人协作规则（AI 必读）

### 文件归属（不可跨区修改）
```
backend/app/models/knowledge.py   ← A 的领地
backend/app/models/problem.py     ← A 的领地
backend/app/routers/auth.py       ← B 的领地
backend/app/routers/judge.py      ← B 的领地
backend/app/routers/knowledge.py  ← A 的领地
backend/app/routers/problems.py   ← A 的领地
backend/app/schemas/              ← 共享，所有人可读，A 负责维护
backend/app/services/rag.py       ← A 的领地
backend/app/services/judge.py     ← B 的领地
frontend/src/                     ← C 的领地
```

### 工作流程
1. **开始工作前**：`git pull` 拉取最新代码
2. **编写代码前**：先 `Read` 对应的 `backend/app/schemas/` 和 `spec.md`
3. **只改自己领地的文件**，不要跨区修改
4. **完成后**：`ruff check` / `npm run lint` → 提交 → 提 PR
5. **PR 合入后**：通知其他人 `git pull`

### API 契约 = Schemas 目录
- 所有 API 的 Request/Response 类型定义在 `backend/app/schemas/`
- 后端实现路由前，先定义 Schema
- 前端开发时，先 Read Schema 文件，不应凭空编造接口

## Lint & TypeCheck 命令
- 后端 lint: `cd backend && ruff check .`
- 后端 format: `cd backend && ruff format .`
- 前端 lint: `cd frontend && npm run lint`
- 前端 typecheck: `cd frontend && npm run typecheck`

## 启动命令
- 全部服务: `docker compose up -d`
- 仅后端: `cd backend && uvicorn app.main:app --reload --port 8000`
- 仅前端: `cd frontend && npm run dev`

## 数据库迁移
- 生成迁移: `cd backend && alembic revision --autogenerate -m "描述"`
- 执行迁移: `cd backend && alembic upgrade head`

## 目录结构
```
algo-tutor/
├── frontend/          # React SPA
├── backend/           # FastAPI
│   ├── app/
│   │   ├── models/    # SQLAlchemy 模型
│   │   ├── schemas/   # Pydantic Schema (API 契约)
│   │   ├── routers/   # API 路由
│   │   ├── services/  # 业务逻辑
│   │   └── core/      # 配置、依赖注入
│   └── alembic/       # 数据库迁移
├── docker-compose.yml
└── .trae/specs/       # Spec 文档
```