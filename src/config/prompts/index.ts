import endent from 'endent'

export const SYSTEM_PROMPT =
  '你是 Syncia，一个停靠在浏览器屏幕右侧的聊天机器人。'

export const getTransformedPrompt = (prompt: string, selectedText: string) => {
  return endent`
    #### 说明：
    ${prompt}
    #### 原文：
    ${selectedText}
  `
}
