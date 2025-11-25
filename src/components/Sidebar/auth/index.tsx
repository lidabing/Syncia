import type React from 'react'
import { useEffect, useState } from 'react'
import { useChatModels } from '../../../hooks/useChatModels'
import { useSettings } from '../../../hooks/useSettings'
import { validateApiKey } from '../../../lib/validApiKey'

const Auth = () => {
  const [settings, setSettings] = useSettings()
  const { models, setActiveChatModel, fetchAvailableModels } = useChatModels()
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    apiKey: settings.chat.openAIKey || '',
    baseUrl: settings.chat.openAiBaseUrl || 'https://api.openai.com/v1',
  })

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    // 自动验证默认配置
    if (settings.chat.openAIKey && settings.chat.openAiBaseUrl && !models.length) {
      validateAndUpdateSettings(settings.chat.openAIKey, settings.chat.openAiBaseUrl)
    }
  }, [])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const newFormData = { ...formData, [id]: value }
    setFormData(newFormData)

    if (id === 'apiKey' && value.startsWith('sk-') && value.length > 40) {
      await validateAndUpdateSettings(value, formData.baseUrl)
    } else if (id === 'baseUrl' && formData.apiKey) {
      await validateAndUpdateSettings(formData.apiKey, value)
    }
  }

  const validateAndUpdateSettings = async (key: string, url: string) => {
    setIsLoadingModels(true)
    try {
      if (await validateApiKey(key, url)) {
        setSettings((prev) => ({
          ...prev,
          chat: { ...prev.chat, openAIKey: key, openAiBaseUrl: url },
        }))
        await fetchAvailableModels()
      } else {
        setError('无效的 API 密钥。请使用有效的密钥。')
      }
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.apiKey || !formData.baseUrl) {
      setError('请填写所有必填字段')
      return
    }
    validateAndUpdateSettings(formData.apiKey, formData.baseUrl)
  }

  return (
    <form
      className="cdx-flex cdx-flex-col cdx-p-6 cdx-justify-center cdx-items-center cdx-h-full"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="cdx-text-2xl cdx-mt-48">输入你的 OpenAI API 密钥</div>
      <div className="cdx-text-sm cdx-text-gray-400 cdx-mt-2">
        你可以在{' '}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="cdx-text-blue-400"
        >
          这里
        </a>
        {' '}获取
      </div>

      <div className="cdx-w-full cdx-mt-6">
        <input
          id="apiKey"
          value={formData.apiKey}
          onChange={handleInputChange}
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="cdx-p-2 cdx-w-full cdx-rounded-md cdx-border dark:cdx-border-neutral-600 cdx-border-neutral-200 dark:cdx-bg-neutral-800/90 cdx-bg-neutral-200/90"
        />
      </div>

      <div className="cdx-w-full cdx-mt-4">
        <input
          id="baseUrl"
          value={formData.baseUrl}
          onChange={handleInputChange}
          placeholder="https://api.openai.com/v1"
          className="cdx-p-2 cdx-w-full cdx-rounded-md cdx-border dark:cdx-border-neutral-600 cdx-border-neutral-200 dark:cdx-bg-neutral-800/90 cdx-bg-neutral-200/90"
        />
      </div>

      <div className="cdx-w-full cdx-mt-4">
        <select
          onChange={(e) => setActiveChatModel(e.target.value)}
          disabled={!models.length}
          className="cdx-p-2 cdx-w-full cdx-rounded-md cdx-border dark:cdx-border-neutral-600 cdx-border-neutral-200 dark:cdx-bg-neutral-800/90 cdx-bg-neutral-200/90 disabled:cdx-opacity-50"
        >
          {isLoadingModels ? (
            <option>加载模型中...</option>
          ) : models.length ? (
            models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))
          ) : (
            <option>添加 API 密钥以加载模型</option>
          )}
        </select>
      </div>

      {error && (
        <div className="cdx-text-sm cdx-text-red-500 cdx-mt-2">{error}</div>
      )}

      <button
        type="button"
        disabled={isLoadingModels}
        onClick={handleSubmit}
        className="cdx-mt-4 cdx-p-2 cdx-w-full cdx-rounded-md cdx-border dark:cdx-border-neutral-600 cdx-border-neutral-200 dark:cdx-bg-neutral-800/90 cdx-bg-neutral-200/90 disabled:cdx-opacity-50"
      >
        {isLoadingModels ? '加载中...' : '提交'}
      </button>

      <div className="cdx-text-sm cdx-text-gray-400 cdx-mt-4">
        注意：我们只在本地存储你的密钥。我们不会将其发送到任何地方。你可以查看{' '}
        <a
          href="https://github.com/Royal-lobster/Syncia"
          className="cdx-text-blue-400"
        >
          源代码
        </a>
        {' '}并检查网络选项卡以验证这一点。
      </div>
    </form>
  )
}

export default Auth
