# Project Rules

## 技术栈
- 前端: React 18 + TypeScript + Vite + TailwindCSS
- 后端: Python 3.12 + FastAPI + PostgreSQL + SQLAlchemy 2.0 (async)
- 详见: project_memory.md

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