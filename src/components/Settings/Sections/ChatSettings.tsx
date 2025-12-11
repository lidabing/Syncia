import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { HiOutlineCheck, HiOutlineKey, HiOutlineChat } from 'react-icons/hi'
import { Mode } from '../../../config/settings'
import { useChatModels } from '../../../hooks/useChatModels'
import { useSettings } from '../../../hooks/useSettings'
import { useLanguage } from '../../../hooks/useLanguage'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'

import { validateApiKey } from '../../../lib/validApiKey'

const ChatSettings = () => {
  const [settings, setSettings] = useSettings()
  const [showPassword, setShowPassword] = useState(false)
  const { models, setActiveChatModel } = useChatModels()
  const { t } = useLanguage()
  const OpenAiApiKeyInputRef = React.useRef<HTMLInputElement>(null)
  const OpenAiBaseUrlInputRef = React.useRef<HTMLInputElement>(null)

  const chatSettings = settings.chat

  const handleOpenAiKeySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    const apiKeyValue = OpenAiApiKeyInputRef.current?.value || ''
    const baseurlValue = OpenAiBaseUrlInputRef.current?.value || ''

    if (OpenAiApiKeyInputRef.current) {
      const isOpenAiKeyValid: boolean = await validateApiKey(
        apiKeyValue,
        baseurlValue,
      )
      if (isOpenAiKeyValid) {
        setSettings({
          ...settings,
          chat: {
            ...chatSettings,
            openAIKey: apiKeyValue,
            openAiBaseUrl: baseurlValue,
          },
        })
      }
      const inputStyles = isOpenAiKeyValid
        ? { classname: 'input-success', value: `✅  ${apiKeyValue}` }
        : { classname: 'input-failed', value: `❌  ${apiKeyValue}` }

      OpenAiApiKeyInputRef.current.classList.add(inputStyles.classname)
      OpenAiApiKeyInputRef.current.value = inputStyles.value
      setTimeout(() => {
        if (!OpenAiApiKeyInputRef.current) return
        OpenAiApiKeyInputRef.current?.classList.remove(inputStyles.classname)
        OpenAiApiKeyInputRef.current.value = apiKeyValue
      }, 2000)
    }

    if (OpenAiBaseUrlInputRef.current) {
      OpenAiBaseUrlInputRef.current.classList.add('input-success')
      OpenAiBaseUrlInputRef.current.value = `✅ ${baseurlValue}`
      setTimeout(() => {
        if (!OpenAiBaseUrlInputRef.current) return
        OpenAiBaseUrlInputRef.current?.classList.remove('input-success')
        OpenAiBaseUrlInputRef.current.value = baseurlValue
      }, 2000)
    }
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title={t.settings.chat.title}
        icon={<HiOutlineChat />}
        description={t.settings.chat.description}
      />
      <FieldWrapper
        title={t.settings.chat.apiKey.title}
        description={t.settings.chat.apiKey.description}
        onSubmit={handleOpenAiKeySubmit}
      >
        <div className="cdx-flex cdx-gap-2 cdx-items-center">
          <div className="cdx-relative cdx-w-full">
            <div className="cdx-absolute cdx-left-3 cdx-top-1/2 cdx-transform cdx--translate-y-1/2 cdx-text-neutral-400">
              <HiOutlineKey />
            </div>
            <input
              required
              ref={OpenAiApiKeyInputRef}
              name="openAiApiKey"
              placeholder={t.settings.chat.apiKey.placeholder}
              defaultValue={chatSettings.openAIKey || ''}
              type={showPassword ? 'text' : 'password'}
              className="input cdx-pl-9 cdx-pr-10"
            />
            <button
              type="button"
              className="cdx-absolute cdx-right-3 cdx-top-1/2 cdx-transform cdx--translate-y-1/2 cdx-text-neutral-400 hover:cdx-text-neutral-600 dark:hover:cdx-text-neutral-300 cdx-bg-transparent cdx-outline-none cdx-cursor-pointer cdx-transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </button>
          </div>
          <button type="submit" className="btn">
            <HiOutlineCheck />
            {t.common.save}
          </button>
        </div>
      </FieldWrapper>
      <FieldWrapper
        title={t.settings.chat.baseUrl.title}
        description={t.settings.chat.baseUrl.description}
        onSubmit={handleOpenAiKeySubmit}
      >
        <div className="cdx-flex cdx-gap-2 cdx-items-center">
          <input
            ref={OpenAiBaseUrlInputRef}
            name="openAiBaseUrl"
            defaultValue={chatSettings.openAiBaseUrl || ''}
            placeholder={t.settings.chat.baseUrl.placeholder}
            className="input cdx-w-full cdx-font-mono cdx-text-sm"
          />
          <button type="submit" className="btn">
            <HiOutlineCheck />
            {t.common.save}
          </button>
        </div>
      </FieldWrapper>
      <FieldWrapper
        title={t.settings.chat.model.title}
        description={t.settings.chat.model.description}
        row={true}
      >
        <select
          value={chatSettings.model || ''}
          className="input cdx-w-44"
          onChange={(e) => setActiveChatModel(e.target.value)}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id}
            </option>
          ))}
        </select>
      </FieldWrapper>
      <FieldWrapper
        title={t.settings.chat.creativity.title}
        description={t.settings.chat.creativity.description}
        row={true}
      >
        <select
          value={chatSettings.mode}
          onChange={(e) => {
            setSettings({
              ...settings,
              chat: {
                ...chatSettings,
                mode: e.target.value as unknown as Mode,
              },
            })
          }}
          className="input cdx-w-36"
        >
          <option value={Mode.HIGHLY_PRECISE}>{t.settings.chat.creativity.modes.highlyPrecise}</option>
          <option value={Mode.PRECISE}>{t.settings.chat.creativity.modes.precise}</option>
          <option value={Mode.BALANCED}>{t.settings.chat.creativity.modes.balanced}</option>
          <option value={Mode.CREATIVE}>{t.settings.chat.creativity.modes.creative}</option>
        </select>
      </FieldWrapper>
    </div>
  )
}

export default ChatSettings
