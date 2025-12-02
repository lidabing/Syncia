# 页面智能建议功能

## 功能概述
当用户打开侧边栏并开始一个新的聊天时，系统会自动分析当前网页内容，并使用 AI 生成三条可能的操作建议。用户可以直接点击任何一条建议来开始对话。

## 实现架构

### 1. 核心 Hook: `usePageSuggestions`
位置: `src/hooks/usePageSuggestions.ts`

**功能:**
- 检测当前是否为新聊天会话（messages.length <= 1）
- 获取当前页面的文本内容
- 调用 LLM API 分析页面内容并生成建议
- 自动缓存页面 URL，避免重复分析同一页面

**返回值:**
```typescript
{
  suggestions: string[],      // 建议列表（最多3条）
  isLoading: boolean,          // 是否正在加载
  error: Error | null,         // 错误信息
  hasSuggestions: boolean      // 是否有可用建议
}
```

### 2. LLM 集成: `useChatCompletion.analyzePage`
位置: `src/hooks/useChatCompletion.ts`

新增方法 `analyzePage(pageContent: string): Promise<string[]>`

**工作流程:**
1. 接收页面内容（限制前 3000 字符）
2. 构造分析提示词，要求返回 JSON 格式的建议数组
3. 使用 LangChain 的 ChatOpenAI 调用 LLM
4. 解析返回的 JSON，提取建议列表
5. 返回最多 3 条建议

### 3. UI 组件: `PageSuggestions`
位置: `src/components/Sidebar/chat/PageSuggestions.tsx`

**特性:**
- 显示在聊天列表上方
- 加载时显示 3 个骨架屏动画
- 每条建议以独立的按钮形式展示（无编号）
- 点击建议后，其内容会自动填充到聊天输入框
- 无建议时自动隐藏

**样式特点:**
- 深色/浅色主题自适应
- Hover 效果提供视觉反馈
- 使用 Tailwind CSS（cdx- 前缀）

### 4. 集成到聊天界面
位置: `src/components/Sidebar/chat/index.tsx`

在 `<ChatList>` 之前插入 `<PageSuggestions>` 组件。当用户点击一条建议时，`onSelectSuggestion` 事件会触发 `useMessageDraft` hook 的 `setMessageDraftText` 方法，将建议内容填充到聊天输入框中，而不是直接发送。

## 用户体验流程

1. 用户在任意网页上打开 Syncia 侧边栏。
2. 系统自动分析页面内容（约 1-3 秒），并在聊天区域上方显示 3 条个性化建议。
3. 用户点击任意一条建议。
4. **该建议的文本被填充到聊天输入框中**，输入框自动获得焦点。
5. 用户可以**按需编辑或完善**输入框中的问题。
6. 用户点击“发送”按钮，正式开始对话。
7. 对话开始后，建议区域自动隐藏。

## 性能优化

- **内容截断**: 仅发送页面前 3000 字符给 LLM
- **URL 缓存**: 同一页面不重复分析
- **条件渲染**: 无建议时不渲染 DOM
- **独立请求**: 使用独立的 AbortController，不干扰主聊天流程

## 配置要求

使用此功能需要：
- 有效的 OpenAI API Key（或兼容的 Ollama 端点）
- 选择支持的模型（默认: gpt-3.5-turbo）
- 配置路径: 设置页面 → Chat Settings

## 错误处理

- API 调用失败 → 静默失败，不显示建议
- 页面内容获取失败 → 跳过建议生成
- JSON 解析失败 → 返回空数组
- 所有错误均记录到控制台便于调试

## 未来扩展

可能的改进方向：
- 支持用户自定义建议数量（3/5/7）
- 允许用户刷新建议
- 根据页面类型（文章/商品/视频）定制建议类型
- 缓存历史建议供用户重新选择
