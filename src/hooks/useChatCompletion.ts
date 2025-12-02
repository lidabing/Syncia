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
      // Extract more content for better context (5000 chars instead of 3000)
      const contentToAnalyze = pageContent.slice(0, 5000)
      
      const analysisPrompt = `你是一个专业的内容分析助手。请仔细阅读以下网页内容，识别出页面的核心主题、关键信息和重要观点。

网页内容：
${contentToAnalyze}

请基于页面的核心内容，提出 3 个最有价值的问题或操作建议。要求：
1. 必须针对页面的主要话题和关键信息
2. 问题要具有深度，能帮助用户深入理解核心内容
3. 每条建议不超过 20 个字，要具体、可执行
4. 优先关注：数据、观点、结论、技术细节、因果关系等关键要素

只返回一个包含 3 个中文字符串的 JSON 数组，不要有其他内容。

示例（针对股票分析文章）：
["分析文中提到的主要估值指标及其含义", "总结作者对该股票的核心投资逻辑", "对比文中的技术面和基本面分析结论"]

示例（针对技术文档）：
["解释核心算法的工作原理和应用场景", "分析文中提到的性能优化策略", "总结该技术的优势和潜在局限性"]`

      const messages = [
        new SystemMessage('你是一个专业的内容分析专家，擅长快速识别文章的核心要点和关键信息。你的目标是帮助用户快速抓住页面最有价值的内容。请务必用中文回答。'),
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
