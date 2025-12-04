# Smart Lens - 智能链接预览

> 悬停链接 + 按 Space 键，即时预览任何网页内容

## ✨ 功能特点

- 🎯 **无干扰预览** - 不用打开新标签页，原地预览链接内容
- 🎬 **视频内嵌播放** - YouTube/B站 视频直接在卡片中播放
- 💻 **GitHub 仓库卡片** - 显示 Star 数、编程语言、项目描述
- 📰 **文章智能摘要** - 展示标题、描述、阅读时间，支持 AI 摘要
- 🛒 **商品预览** - 显示价格、评分、商品图片，支持 AI 卖点分析
- 🧠 **智能类型识别** - 自动识别内容类型并生成针对性摘要

## 🚀 快速开始

### 触发预览

| 方式 | 操作 | 说明 |
|------|------|------|
| **Space 键** (推荐) | 悬停链接 + 按 Space | 最精准，类似 macOS Quick Look |
| Shift 键 | 悬停链接 + 按 Shift | 备用方式 |

### 关闭预览

- 按 **Escape** 键
- 点击卡片上的 **✕** 按钮
- 鼠标移开链接

## 📦 预览类型

### 🎬 视频

```
┌─────────────────────────────┐
│  ▶ 嵌入式视频播放器          │
│    (YouTube / Bilibili)      │
├─────────────────────────────┤
│ 视频标题                      │
│ ⏱️ 时长  👤 作者              │
└─────────────────────────────┘
```

支持平台：YouTube、Bilibili

### 💻 代码仓库 (GitHub)

```
┌─────────────────────────────┐
│ 📦 [头像] 仓库名             │
│     作者名                   │
├─────────────────────────────┤
│ 项目描述...                  │
├─────────────────────────────┤
│ 🤖 代码分析 (AI)             │
│ • 项目功能                   │
│ • 技术栈                     │
│ • 核心特性                   │
├─────────────────────────────┤
│ ⭐ 12.5k  🟡 JavaScript      │
└─────────────────────────────┘
```

### 📰 文章

```
┌─────────────────────────────┐
│  [封面图]                    │
├─────────────────────────────┤
│ 文章标题                      │
├─────────────────────────────┤
│ ✨ AI 摘要                   │
│ • 核心观点                   │
│ • 关键要点                   │
│ • 适用人群                   │
├─────────────────────────────┤
│ 📖 5 min  ✍️ 作者  📅 日期   │
└─────────────────────────────┘
```

### 🛒 商品

```
┌─────────────────────────────┐
│      [商品图片]              │
├─────────────────────────────┤
│ 商品名称                      │
│ ¥199.00  ⭐⭐⭐⭐☆            │
├─────────────────────────────┤
│ 🛍️ 商品分析 (AI)             │
│ • 主要卖点                   │
│ • 价格分析                   │
│ • 评价总结                   │
└─────────────────────────────┘
```

## ⚙️ 设置选项

在扩展设置 → **智能预览透镜** 中配置：

| 选项 | 说明 |
|------|------|
| 启用 Smart Lens | 开关功能 |
| 显示视觉提示 | 悬停时显示小图标 |
| 启用 AI 摘要 | 自动生成针对性摘要 (需 API Key) |

## 🧠 AI 智能分析

Smart Lens 会根据链接类型自动选择最佳的分析策略：

- **代码库**: 分析项目功能、技术栈和核心特性
- **商品页**: 提取商品卖点、价格信息和用户评价总结
- **文章**: 生成核心观点、关键要点和适用人群简报
- **视频**: 总结视频主要内容和看点

所有摘要均支持 Markdown 格式渲染，提供结构化的阅读体验。

## 🏗️ 技术架构

### 处理流程

```
用户悬停链接 + 按 Space
        ↓
Content Script (smart-lens/index.tsx)
        ↓ 发送消息 (含页面上下文)
Background Service Worker (fetchPreview.ts)
        ↓
   ┌────┴────┐
   ↓         ↓
平台适配器   HTML 抓取
(GitHub API) (通用 Fetch)
   └────┬────┘
        ↓
   内容清洗 (contentCleaner)
        ↓
   AI 结构化分析 (aiAnalyzer)
        ↓
   返回 LinkPreviewData + AIAnalysisResult
        ↓
PreviewCard 组件 (Markdown 渲染)
```

### Fetch → Clean → Analyze 流水线

| 阶段 | 模块 | 职责 |
|------|------|------|
| **Fetch** | `platformAdapters.ts` | 平台专用 API 抓取 (GitHub/YouTube) |
| **Clean** | `contentCleaner.ts` | Readability 风格内容清洗 |
| **Analyze** | `aiAnalyzer.ts` | 结构化 JSON AI 分析 |

### 目录结构

```
src/
├── config/settings/smartLens.ts     # 类型定义 (AIAnalysisResult, LinkPreviewData)
├── components/SmartLens/
│   ├── PreviewCard.tsx              # 预览卡片组件 (Markdown 渲染)
│   └── VisualCue.tsx                # 链接悬停检测
├── lib/smartLens/
│   ├── contentFetcher.ts            # OG 解析 & 简单摘要 (降级方案)
│   ├── contentCleaner.ts            # HTML 内容清洗器
│   ├── platformAdapters.ts          # 平台专用适配器 (GitHub/YouTube)
│   └── aiAnalyzer.ts                # 结构化 AI 分析引擎
├── pages/content/smart-lens/
│   └── index.tsx                    # 主 Content Script
└── pages/background/smart-lens/
    └── fetchPreview.ts              # Background 处理器 (流水线入口)
```

### AI 分析结果结构

```typescript
interface AIAnalysisResult {
  type: 'news' | 'tutorial' | 'documentation' | 'repository' | 'product' | 'discussion' | 'video' | 'social' | 'general'
  confidence: number // 0-1 置信度
  summary: string    // 一句话摘要
  meta: {
    keyPoints?: string[]      // 关键要点 (最多5个)
    topic?: string            // 主题分类
    sentiment?: 'positive' | 'negative' | 'neutral'
    techStack?: string[]      // 技术栈
    actionItems?: string[]    // 建议操作
    relevance?: string        // 与当前页面关联
    readingTime?: string      // 预估阅读时间
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    freshness?: 'breaking' | 'recent' | 'dated' | 'evergreen'
  }
}
```

## 🔧 开发指南

### 添加新的内容类型

1. **定义类型** (`smartLens.ts`)
```typescript
type: 'article' | 'video' | 'code' | 'product' | 'new-type'
```

2. **添加检测逻辑** (`contentFetcher.ts`)
```typescript
if (url.includes('new-domain.com')) {
  return 'new-type'
}
```

3. **添加渲染逻辑** (`PreviewCard.tsx`)
```typescript
const renderNewTypePreview = () => {
  // 自定义渲染...
}
```

### 调试

```bash
# 查看 Content Script 日志
F12 → Console → 过滤 "[Smart Lens]"

# 查看 Background 日志
chrome://extensions/ → 扩展详情 → Service Worker
```

## ⚠️ 已知限制

| 限制 | 原因 | 解决方案 |
|------|------|---------|
| 部分网站无法预览 | X-Frame-Options 限制 | 显示元数据卡片 |
| 信息不完整 | 网站缺少 Open Graph 标签 | 尽量提取可用信息 |
| HTTP 链接警告 | HTTPS 页面请求 HTTP | 使用背景脚本代理 |

## 📋 更新日志

### v1.1 (2025-12-04)
- ✅ **Fetch → Clean → Analyze 三步流水线**
- ✅ 结构化 AI 分析 (`AIAnalysisResult`)
- ✅ 内容清洗模块 (Readability 风格)
- ✅ 平台专用适配器 (GitHub API, YouTube)
- ✅ 8 种内容类型智能识别
- ✅ 丰富的元数据输出 (要点/技术栈/难度/时效性等)
- ✅ Markdown 格式化渲染
- ✅ 默认开启 Smart Lens
- ✅ 默认模型更换为 deepseek-v3.1
- 🔧 修复 YouTube 嵌入播放错误 (改用缩略图+点击)
- 🔧 修复钉住模式不生效问题

### v1.0 (2025-12-03)
- ✅ 基础预览功能
- ✅ Space/Shift 键触发
- ✅ 视频/代码/文章/商品 四种类型
- ✅ YouTube/Bilibili 嵌入播放
- ✅ GitHub 仓库卡片
- ✅ AI 摘要支持

---

**灵感来源**: macOS Quick Look, Arc Browser Peek
