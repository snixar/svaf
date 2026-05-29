# svaf-astro

基于astro对afoim/svaf博客部分进行重构并保留原有视觉样式，支持在线发布文章。


## 开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发服务器 http://localhost:4321
pnpm build            # 构建静态站点到 dist/
pnpm preview          # 预览构建结果
pnpm new-post         # 创建新文章（命令行）
```

## 项目结构

```
src/
├── app.css                   # 全局样式（Tailwind + OKLCH 变量）
├── content/
│   ├── config.ts             # Content Collection schema
│   └── posts/                # 文章（Markdown + 资源）
│       └── slug/index.md
├── components/
│   ├── NavBar.astro          # 导航栏（首页隐藏）
│   ├── Footer.astro          # 页脚
│   ├── ThemeToggle.svelte    # 明暗主题切换（island）
│   ├── SearchPanel.svelte    # 文章搜索 + 分页（island）
│   ├── PostToc.svelte        # 文章目录导航（island）
│   ├── BackToTop.svelte      # 回到顶部（island）
│   ├── KatexRenderer.svelte  # LaTeX 数学公式（island）
│   ├── MermaidRenderer.svelte # Mermaid 图表（island）
│   ├── ImageViewer.svelte    # PhotoSwipe 图片查看（island）
│   ├── Giscus.svelte         # 评论区（island）
│   ├── Analytics.svelte      # 多平台统计（island）
│   ├── CookieConsent.svelte  # Cookie 授权弹窗（island）
│   ├── MotionAnimations.svelte # 滚动动画（island）
│   └── write/                # 在线文章管理
│       ├── AuthGuard.svelte  # GitHub Token 认证
│       ├── EditorPage.svelte # 编辑器编排
│       ├── EditorForm.svelte # Markdown 编辑 + 预览
│       └── ArticleList.svelte # 文章列表
├── layouts/
│   └── BaseLayout.astro      # 全局布局（SEO + ViewTransitions）
├── lib/
│   ├── config/site.ts        # 站点配置
│   ├── github-api.ts         # GitHub REST API 封装
│   ├── stores/theme.ts       # 主题状态
│   └── utils/                # 工具函数
└── pages/
    ├── index.astro           # 首页（目录卡片）
    ├── posts/
    │   ├── index.astro       # 文章列表（搜索 + 筛选）
    │   └── [slug].astro      # 文章详情
    ├── write.astro           # 在线编辑器
    ├── rss.xml.ts            # RSS Feed
    ├── sitemap.xml.ts        # 站点地图
    └── robots.txt.ts         # 爬虫规则
```

## 功能

- **目录分类** — 文章按 frontmatter `dir` 字段分组，首页展示目录卡片
- **全局搜索** — 客户端全文搜索（标题/简介/正文/路径），搜索结果高亮
- **明暗主题** — 一键切换 Light/Dark 模式，刷新不闪烁
- **代码高亮** — Shiki 构建时渲染，GitHub 配色，明暗主题自适应
- **Mermaid 图表** — CDN 按需加载，主题切换自动重渲染
- **页面过渡** — Astro View Transitions 淡入淡出
- **滚动动画** — Motion One 渐入上滑、逐项出现
- **在线发布** — 访问 `/write`，通过 GitHub API 直接发布文章

## 在线发布（/write）

访问 `/write` 页面，输入 GitHub Personal Access Token 后可以：

- 新建 / 编辑 / 删除文章
- Markdown 编辑器 + 实时预览
- 一键发布到 GitHub 仓库
- Cloudflare Pages 自动构建部署

### 环境变量

在 Cloudflare Pages 后台设置：

| 变量 | 说明 |
|------|------|
| `PUBLIC_GITHUB_OWNER` | GitHub 用户名 |
| `PUBLIC_GITHUB_REPO` | 博客仓库名 |
| `PUBLIC_GITHUB_BRANCH` | 分支名（默认 main） |

### 创建 Token

1. 访问 [GitHub Settings → Tokens](https://github.com/settings/tokens/new)
2. 选择 `repo` 权限
3. 生成后粘贴到 `/write` 页面（Token 仅存 sessionStorage）

## 文章格式

每篇文章是 `src/content/posts/<slug>/index.md`：

```markdown
---
title: "文章标题"
description: "文章摘要"
published: 2026-05-15
dir: "技术"
pinned: false
---

正文内容（Markdown）...
```

| frontmatter | 说明 |
|-------------|------|
| `title` | 文章标题（必填） |
| `description` | 文章摘要（必填） |
| `published` | 发布日期 |
| `dir` | 所属目录（默认"未分类"） |
| `pinned` | 置顶 |
| `draft` | 草稿（不发布） |
| `hide` | 隐藏（不在列表显示） |
| `image` | 封面图 URL |



## License

AGPL-3.0 © snixar
