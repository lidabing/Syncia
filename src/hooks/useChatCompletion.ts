import endent from 'endent'
import { ChatOpenAI } from '@langchain/openai'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { useEffect, useMemo, useState } from 'react'
import type { Mode } from '../config/settings'
import { getMatchedContent } from '../lib/getMatchedContent'
import { ChatRole, useCurrentChat } from './useCurrentChat'
import type { MessageDraft } from './useMessageDraft'

interface UseChatCompletionProps {
  model: string
  apiKey: string
  mode: Mode
  systemPrompt: string
  baseURL: string
}

let controller: AbortController

export const useChatCompletion = ({
  model,
  apiKey,
  mode,
  systemPrompt,
  baseURL,
}: UseChatCompletionProps) => {
  const {
    messages,
    updateAssistantMessage,
    addNewMessage,
    commitToStoredMessages,
    clearMessages,
    removeMessagePair,
  } = useCurrentChat()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  console.log('[useChatCompletion] generating:', generating, 'messages:', messages.length)

  // 初始化时确保状态正常
  useEffect(() => {
    setGenerating(false)
  }, [])

  const llm = useMemo(() => {
    return new ChatOpenAI({
      streaming: true,
      openAIApiKey: apiKey,
      modelName: model,
      configuration: {
        baseURL: baseURL,
      },
      temperature: Number(mode),
    })
  }, [apiKey, model, mode, baseURL])

  const previousMessages = messages.map((msg) => {
    switch (msg.role) {
      case ChatRole.ASSISTANT:
        return new AIMessage(msg.content)
      case ChatRole.SYSTEM:
        return new SystemMessage(msg.content)
      case ChatRole.USER:
        return new HumanMessage(msg.content)
    }
  })

  const submitQuery = async (message: MessageDraft, context?: string) => {
    await addNewMessage(ChatRole.USER, message)
    controller = new AbortController()
    const options = {
      signal: controller.signal,
      callbacks: [{ handleLLMNewToken: updateAssistantMessage }],
    }

    setError(null)
    setGenerating(true)

    try {
      let matchedContext: string | undefined
      if (context) {
        matchedContext = await getMatchedContent(
          message.text,
          context,
          apiKey,
          baseURL,
        )
      }

      const expandedQuery = matchedContext
        ? endent`
      ### Context
      ${matchedContext}
      ### Question:
      ${message.text}
    `
        : message.text

      const messages = [
        new SystemMessage(systemPrompt),
        ...previousMessages,
        new HumanMessage({
          content:
            message.files.length > 0
              ? [
                  { type: 'text', text: expandedQuery },
                  ...(message.files.length > 0
                    ? await Promise.all(
                        message.files.map(async (file) => {
                          return {
                            type: 'image_url',
                            image_url: { url: file.src },
                          } as const
                        }),
                      )
                    : []),
                ]
              : expandedQuery,
        }),
      ]

      console.log(JSON.stringify(messages, null, 2))

      await llm.invoke(messages, options)
    } catch (e) {
      setError(e as Error)
    } finally {
      commitToStoredMessages()
      setGenerating(false)
    }
  }

  const cancelRequest = () => {
    controller.abort()
    commitToStoredMessages()
    setGenerating(false)
  }

  const clearMessagesAndReset = async () => {
    setGenerating(false)
    setError(null)
    await clearMessages()
  }

  const analyzePage = async (pageContent: string): Promise<string[]> => {
    try {
      // Extract more content for better context (8000 chars for deeper analysis)
      const contentToAnalyze = pageContent.slice(0, 8000)
      
      const analysisPrompt = `你是一个专业的内容分析助手。请仔细阅读以下网页内容，深入挖掘其核心信息、数据细节、论点逻辑和关键观点。

网页内容：
${contentToAnalyze}

请基于页面的具体内容和细节，提出 3 个精准、细致的问题。要求：

1. **精准性**：必须针对页面中明确提到的具体数据、观点、事实或论述
2. **细致性**：聚焦于具体细节，而非宽泛概念（如：具体的数字、百分比、时间点、人名、技术术语等）
3. **深度性**：问题要能引导用户深入理解关键信息的含义、原因、影响或关联
4. **可回答性**：必须是页面内容能够直接回答的问题
5. **长度限制**：每条问题 15-25 个字

优先关注的内容类型：
- 具体数据和统计信息（数字、百分比、增长率等）
- 核心论点和结论
- 因果关系和逻辑推理
- 关键术语和概念定义
- 时间线和发展趋势
- 对比和差异分析

只返回一个包含 3 个中文字符串的 JSON 数组，不要有其他内容。

【反例】宽泛问题：
- "这篇文章主要讲什么？" （太宽泛）
- "如何理解这个概念？" （不具体）
- "作者的观点是什么？" （缺乏细节）

【正例】精准问题：
针对股票分析："解释文中提到的 PE 为 25 倍是否合理及原因"
针对技术文章："分析 Redis 性能提升 40% 的具体优化手段"
针对新闻报道："说明 Q3 营收同比增长 18% 的主要驱动因素"

现在请分析网页内容，生成 3 个精准细致的问题。`

      const messages = [
        new SystemMessage('你是一个专业的内容分析专家，擅长从文本中提取关键信息和细节。你的目标是生成针对具体内容的精准问题，而非宽泛的概述性问题。必须用中文回答。'),
        new HumanMessage(analysisPrompt),
      ]

      let fullResponse = ''
      const tempController = new AbortController()
      
      await llm.invoke(messages, {
        signal: tempController.signal,
        callbacks: [{
          handleLLMNewToken: (token: string) => {
            fullResponse += token
          }
        }]
      })

      // Parse JSON response
      const jsonMatch = fullResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0])
        return Array.isArray(suggestions) ? suggestions.slice(0, 3) : []
      }
      
      return []
    } catch (e) {
      console.error('Failed to analyze page:', e)
      return []
    }
  }

  return {
    messages,
    submitQuery,
    generating,
    cancelRequest,
    clearMessages: clearMessagesAndReset,
    removeMessagePair,
    error,
    analyzePage,
  }
}

export type UseChatCompletion = ReturnType<typeof useChatCompletion>
