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
      className="cdx-flex cdx-flex-col cdx-px-6 cdx-justify-center cdx-items-center cdx-h-full"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Logo */}
      <div className="cdx-w-16 cdx-h-16 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-2xl cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-indigo-600 cdx-shadow-lg cdx-shadow-blue-500/20 cdx-mb-6">
        <svg className="cdx-w-8 cdx-h-8 cdx-text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
      
      <h2 className="cdx-text-xl cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-white cdx-mb-2">连接你的 AI 服务</h2>
      <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-text-center cdx-mb-8">
        输入 API 密钥以开始使用千羽助手
      </p>

      <div className="cdx-w-full cdx-space-y-4">
        {/* API Key Input */}
        <div>
          <label className="cdx-block cdx-text-xs cdx-font-medium cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mb-1.5 cdx-uppercase cdx-tracking-wide">API 密钥</label>
          <input
            id="apiKey"
            value={formData.apiKey}
            onChange={handleInputChange}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="cdx-p-3 cdx-w-full cdx-rounded-xl cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-bg-white dark:cdx-bg-neutral-800 cdx-text-sm focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-blue-500/20 focus:cdx-border-blue-500 cdx-transition-all cdx-placeholder-neutral-400"
          />
        </div>

        {/* Base URL Input */}
        <div>
          <label className="cdx-block cdx-text-xs cdx-font-medium cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mb-1.5 cdx-uppercase cdx-tracking-wide">API 地址</label>
          <input
            id="baseUrl"
            value={formData.baseUrl}
            onChange={handleInputChange}
            placeholder="https://api.openai.com/v1"
            className="cdx-p-3 cdx-w-full cdx-rounded-xl cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-bg-white dark:cdx-bg-neutral-800 cdx-text-sm focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-blue-500/20 focus:cdx-border-blue-500 cdx-transition-all cdx-placeholder-neutral-400"
          />
        </div>

        {/* Model Select */}
        <div>
          <label className="cdx-block cdx-text-xs cdx-font-medium cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mb-1.5 cdx-uppercase cdx-tracking-wide">选择模型</label>
          <select
            onChange={(e) => setActiveChatModel(e.target.value)}
            disabled={!models.length}
            className="cdx-p-3 cdx-w-full cdx-rounded-xl cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-bg-white dark:cdx-bg-neutral-800 cdx-text-sm focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-blue-500/20 focus:cdx-border-blue-500 cdx-transition-all disabled:cdx-opacity-50 cdx-cursor-pointer"
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
              <option>输入 API 密钥后加载模型</option>
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="cdx-w-full cdx-mt-4 cdx-px-4 cdx-py-3 cdx-rounded-xl cdx-bg-red-50 dark:cdx-bg-red-900/20 cdx-border cdx-border-red-100 dark:cdx-border-red-900/30 cdx-text-sm cdx-text-red-600 dark:cdx-text-red-400">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={isLoadingModels}
        onClick={handleSubmit}
        className="cdx-mt-6 cdx-p-3 cdx-w-full cdx-rounded-xl cdx-bg-gradient-to-r cdx-from-blue-500 cdx-to-indigo-600 hover:cdx-from-blue-600 hover:cdx-to-indigo-700 cdx-text-white cdx-font-medium cdx-shadow-lg cdx-shadow-blue-500/20 cdx-transition-all disabled:cdx-opacity-50 disabled:cdx-cursor-not-allowed"
      >
        {isLoadingModels ? '验证中...' : '开始使用'}
      </button>

      <p className="cdx-text-xs cdx-text-neutral-400 dark:cdx-text-neutral-500 cdx-mt-6 cdx-text-center cdx-leading-relaxed">
        密钥仅存储在本地，不会上传到任何服务器。
        <a
          href="https://github.com/Royal-lobster/Syncia"
          className="cdx-text-blue-500 hover:cdx-underline cdx-ml-1"
          target="_blank"
          rel="noreferrer"
        >
          查看源码
        </a>
      </p>
    </form>
  )
}

export default Auth
