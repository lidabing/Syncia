import endent from 'endent'
import type { Prompt } from '../../hooks/usePrompts'
import hash from 'object-hash'

type PromptWithoutId = Omit<Prompt, 'id' | 'children'> & {
  children?: PromptWithoutId[]
}

const prompts: PromptWithoutId[] = [
  {
    name: '审阅选中内容',
    children: [
      {
        name: '总结',
        prompt: endent`
          阅读以下文本并用不到原文一半的篇幅进行总结。
        `,
      },
      {
        name: '关键要点',
        prompt: endent`
          阅读以下文本并以列表形式列出关键要点。
        `,
      },
      {
        name: '关键问题',
        prompt: endent`
          阅读以下文本并找出其中提出的关键问题。
        `,
      },
    ],
  },
  {
    name: '编辑选中内容',
    children: [
      {
        name: '修正语法和拼写',
        prompt: endent`
          阅读以下文本并修正其中的语法和拼写错误。
        `,
      },
      {
        name: '改变语气',
        children: [
          {
            name: '正式',
            prompt: endent`
              阅读以下文本并使其更加正式。
            `,
          },
          {
            name: '非正式',
            prompt: endent`
              阅读以下文本并使其更加非正式。
            `,
          },
          {
            name: '中性',
            prompt: endent`
              阅读以下文本并使其更加中性。
            `,
          },
          {
            name: '强烈',
            prompt: endent`
              阅读以下文本并使其更加强烈和果断。
            `,
          },
        ],
      },
      {
        name: '改变长度',
        children: [
          {
            name: '缩短',
            prompt: endent`
              阅读以下文本并将其缩短。
            `,
          },
          {
            name: '加长',
            prompt: endent`
              阅读以下文本并将其加长。
            `,
          },
        ],
      },
      {
        name: '改变结构',
        children: [
          {
            name: '添加细节',
            prompt: endent`
              阅读以下文本并添加细节使其更有信息量。
            `,
          },
          {
            name: '添加示例',
            prompt: endent`
              阅读以下文本并添加示例使其更有信息量。
            `,
          },
          {
            name: '添加重点',
            prompt: endent`
              阅读以下文本并添加重点使其更有影响力。
            `,
          },
        ],
      },
    ],
  },
  {
    name: '回复',
    children: [
      {
        name: '积极',
        prompt: endent`
          阅读以下文本并以积极的方式回复。
        `,
      },
      {
        name: '消极',
        prompt: endent`
          阅读以下文本并以消极的方式回复。
        `,
      },
    ],
  },
]

const recursiveAddId = (
  prompts: PromptWithoutId[],
  _parentId = '',
): Prompt[] => {
  return prompts.map((prompt) => {
    const id = hash(prompt)
    return {
      id,
      ...prompt,
      children: prompt.children
        ? recursiveAddId(prompt.children, id)
        : undefined,
    }
  }) as Prompt[]
}

export const defaultPrompts = recursiveAddId(prompts)
