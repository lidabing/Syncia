# Page Vision - 页面智能识别功能

## 功能概述

Page Vision 是一个基于 AI 视觉能力的页面智能识别功能。它可以：

1. **截图分析**：捕获当前页面截图，使用多模态 AI（如 GPT-4o）进行分析
2. **页面分类**：自动识别页面类型（电商、代码、文章、视频等）
3. **意图推理**：推测用户当前的需求和意图
4. **操作建议**：提供精准、可操作的建议按钮

## 技术架构

```
用户操作 → Content Script → Background → AI API → 结果渲染
```

### 核心组件

| 文件 | 说明 |
|------|------|
| `src/config/settings/pageVision.ts` | 类型定义和配置 |
| `src/lib/pageVision/visionAnalyzer.ts` | AI 分析核心逻辑 |
| `src/pages/background/page-vision/analyzePageVision.ts` | Background 消息处理 |
| `src/hooks/usePageVision.ts` | React Hook |
| `src/components/Sidebar/chat/PageVisionSuggestions.tsx` | UI 组件 |
| `src/components/Settings/Sections/PageVisionSettings.tsx` | 设置页面 |

## 工作流程

### 1. 视觉捕获 (Capture)

```typescript
// Content Script 请求 Background 捕获截图
chrome.runtime.sendMessage({ 
  action: 'page-vision-capture-screenshot' 
})

// Background 使用 chrome.tabs.captureVisibleTab
const screenshot = await chrome.tabs.captureVisibleTab(windowId, {
  format: 'jpeg',
  quality: 80,
})
```

### 2. 多模态分析 (Analyze)

- 将截图 + 页面标题 + URL + 文本内容发送给 AI
- 使用结构化 Prompt 引导 AI 输出 JSON 格式结果
- 支持图片压缩以减少 Token 消耗

### 3. 意图推理 (Infer)

AI 会识别：
- **pageCategory**: 页面类型（10 种类别）
- **userIntent**: 用户意图（9 种意图）
- **actions**: 推荐操作列表

### 4. 交互呈现 (Present)

- 在侧边栏显示分析结果卡片
- 显示页面摘要和关键元素
- 提供可点击的操作按钮

## 页面类别映射

| 页面类型 | 场景示例 | 推荐操作 |
|----------|----------|----------|
| `ecommerce` | 淘宝/京东商品页 | 分析优缺点、全网比价、评论总结 |
| `coding` | GitHub/StackOverflow | 解释代码、修复Bug、生成测试 |
| `article` | 新闻/博客 | 一句话总结、关键要点、深入分析 |
| `documentation` | 技术文档 | 快速入门、示例代码、常见问题 |
| `video` | YouTube/B站 | 视频总结、时间戳导航 |
| `form` | 预订/表单页面 | 翻译表单、填写建议、货币换算 |

## 配置选项

```typescript
interface PageVisionSettings {
  enabled: boolean           // 启用功能
  autoAnalyze: boolean       // 自动分析
  useScreenshot: boolean     // 使用截图
  compressImage: boolean     // 压缩图片
  imageQuality: number       // 图片质量 (0-1)
  maxImageWidth: number      // 最大宽度 (px)
  cacheResults: boolean      // 缓存结果
  cacheDuration: number      // 缓存时长 (分钟)
  sensitiveContentWarning: boolean  // 敏感内容警告
}
```

## 使用说明

1. 打开侧边栏
2. 点击「智能识别页面」按钮
3. 等待 AI 分析（约 2-3 秒）
4. 查看页面摘要和推荐操作
5. 点击操作按钮发送相应提问

## 最佳实践

### 模型选择

推荐使用支持视觉能力的模型：
- GPT-4o / GPT-4o-mini
- Claude 3.5 Sonnet
- Gemini 1.5 Pro

### 性能优化

1. **图片压缩**：默认开启，将图片压缩到 1280px 宽度
2. **结果缓存**：避免重复分析相同页面
3. **按需分析**：默认不自动分析，由用户手动触发

### 隐私保护

1. 检测敏感页面（银行、邮箱等）时显示警告
2. 支持配置排除域名列表
3. 截图仅用于当次分析，不持久化存储

## 扩展开发

### 添加新的页面类别

1. 在 `pageVision.ts` 中添加类别类型
2. 在 `ACTION_TEMPLATES` 中添加默认操作
3. 在 `visionAnalyzer.ts` 的 Prompt 中更新类别说明

### 自定义操作建议

修改 `ACTION_TEMPLATES` 中的模板：

```typescript
export const ACTION_TEMPLATES: Record<PageCategory, Partial<SuggestedAction>[]> = {
  ecommerce: [
    { 
      label: '分析优缺点', 
      query: '基于页面内容，分析这个产品的优点和缺点',
      priority: 1, 
      category: 'primary' 
    },
    // ...
  ],
}
```

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 截图失败 | 权限不足 | 检查 manifest 中的 `activeTab` 权限 |
| 分析超时 | 网络问题 | 增加超时时间或检查 API 连接 |
| 结果不准确 | 模型限制 | 尝试使用更强的视觉模型 |
| 无法识别中文 | Prompt 问题 | 确保 Prompt 使用中文描述 |
