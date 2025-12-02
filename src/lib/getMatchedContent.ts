import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { createSHA256Hash } from './createSHA256Hash'
import { readStorage, setStorage } from '../hooks/useStorage'

export const getMatchedContent = async (
  query: string,
  context: string,
  apiKey: string,
  baseURL: string,
) => {
  try {
    const vectorStore = await getContextVectorStore(context, apiKey, baseURL)
    const retriever = vectorStore.asRetriever()
    const relevantDocs = await retriever.getRelevantDocuments(query)
    return relevantDocs.map((doc) => doc.pageContent).join('\n')
  } catch (error) {
    console.warn('[getMatchedContent] Embeddings API failed, using fallback:', error)
    // 降级方案：使用简单的文本截取（前 3000 字符）
    return context.substring(0, 3000)
  }
}

const getContextVectorStore = async (
  context: string,
  apiKey: string,
  baseURL: string,
) => {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    configuration: {
      baseURL: baseURL,
    },
  })
  const hashKey = `SYNCIA_STORE_EMBEDDINGS_${await createSHA256Hash(context)}`
  const memoryVectors = await readStorage<[]>(hashKey, 'indexedDB')

  if (!memoryVectors) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    })
    const docs = await textSplitter.createDocuments([context])
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings)
    await setStorage(hashKey, store.memoryVectors, 'indexedDB')
    return store
  }

  const store = new MemoryVectorStore(embeddings)
  store.memoryVectors = memoryVectors
  return store
}
