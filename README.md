# my-site

个人网站 — Next.js + Tailwind + Markdown

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS + CSS Variables
- **内容**: Markdown (gray-matter + next-mdx-remote)
- **图片**: yet-another-react-lightbox (Lightbox + 缩略图)
- **字体**: Inter (Google Fonts)
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 访问 http://localhost:3000
```

## 目录结构

```
my-site/
├── app/                  # 页面路由
│   ├── page.tsx          # 首页
│   ├── blog/             # 博客列表 + 详情
│   ├── explore/          # Explore 列表 + 详情
│   └── about/            # About 页
│
├── content/              # ← 你写内容的地方
│   ├── blog/             # 博客文章 (.md)
│   ├── projects/         # 项目 (.md)
│   ├── notes/            # 笔记 (.md)
│   └── life/             # 生活/旅行 (.md)
│
├── components/           # 复用组件
├── lib/content.ts        # 读取 Markdown 工具函数
└── styles/
    ├── globals.css       # 主题颜色变量
    └── prose.css         # Markdown 渲染样式
```

## 写内容

每个 `.md` 文件顶部用 Front Matter 填写元数据：

### Blog / Notes

```markdown
---
title: "文章标题"
date: "2025-04-10"
tags: ["Product", "Web3"]
summary: "简短描述，显示在卡片上"
cover: /images/cover.jpg   # 可选
published: true
---

正文从这里开始...
```

### Project

```markdown
---
title: "项目名称"
date: "2025-03-01"
tags: ["Web3"]
summary: "项目描述"
links:
  github: "https://github.com/..."
  demo: "https://..."
  figma: "https://..."
published: true
---
```

### Life (Gallery)

```markdown
---
title: "Japan · Spring 2024"
date: "2024-04-05"
tags: ["Travel"]
location: "Tokyo, Japan"
photos:
  - /images/japan/photo1.jpg
  - /images/japan/photo2.jpg
published: true
---

文字描述（可选）
```

图片放在 `public/images/` 目录下，路径写 `/images/...` 即可。

## 主题颜色

修改 `styles/globals.css` 里的 CSS 变量来调整颜色：

```css
:root {          /* 浅色 */
  --accent-hex: #6366F1;   /* 主色调 */
  ...
}
.dark {          /* 深色 */
  --accent-hex: #818CF8;
  ...
}
```

## Markdown 样式

修改 `styles/prose.css` 来调整文章正文的渲染样式。

## 部署到 Vercel

```bash
npm install -g vercel
vercel
```
