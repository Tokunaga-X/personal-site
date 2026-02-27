# Personal Portfolio Site (Vite + React)

这是从旧版 Next.js 作品集迁移而来的前端项目，目标是保持页面样式和交互基本一致，同时切换到 Vite + React + TypeScript + Tailwind 技术栈。

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Font Awesome

## 本地开发

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 迁移说明

- 旧项目目录 `Tokunaga-X.github.io` 保持不变。
- 新项目是纯前端应用，不包含 Next.js Route Handler。
- 旧版 `/api/hello` 未迁移；新项目不提供该接口。
- 保留了原站点的页面结构与主要文件组织（`src/app/.../page.tsx`）。
- 已修复：暗黑模式状态同步、语言文案统一与 `html lang` 同步、README 拼写与说明。
- 按当前范围保留：Projects 的 Live Demo 占位行为未改动。
