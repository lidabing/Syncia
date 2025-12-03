/**
 * Smart Lens Settings Section
 */

import React from 'react'
import * as Switch from '@radix-ui/react-switch'
import { useSettings } from '../../../hooks/useSettings'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'
import { DEFAULT_SMART_LENS_SETTINGS } from '../../../config/settings/smartLens'
import { HiOutlineLightBulb } from 'react-icons/hi'

export const SmartLensSettings = () => {
  const [settings, setSettings] = useSettings()

  // 使用默认值以防 smartLens 未定义
  const smartLens = settings.smartLens || DEFAULT_SMART_LENS_SETTINGS

  const updateSmartLens = (key: string, value: boolean | string | number | string[]) => {
    setSettings({
      ...settings,
      smartLens: {
        ...smartLens,
        [key]: value,
      },
    })
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title="智能预览透镜" 
        icon="lens"
        description="悬停链接时即时预览内容"
      />

      <FieldWrapper 
        title="启用 Smart Lens" 
        description="鼠标悬停链接显示预览卡片"
        row
      >
        <Switch.Root
          checked={smartLens?.enabled ?? false}
          onCheckedChange={(checked: boolean) => updateSmartLens('enabled', checked)}
          className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
        >
          <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
        </Switch.Root>
      </FieldWrapper>

      {smartLens?.enabled && (
        <>
          <FieldWrapper title="触发模式" description="选择如何触发预览">
            <div className="cdx-grid cdx-grid-cols-1 cdx-gap-2">
              {[
                { value: 'space', label: '悬停 + Space', desc: '类似 macOS Quick Look', recommended: true },
                { value: 'hover', label: '自动悬停', desc: '带延迟自动显示' },
                { value: 'shift-hover', label: '悬停 + Shift', desc: '按住 Shift 触发' },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className={`cdx-flex cdx-items-center cdx-gap-3 cdx-p-3 cdx-rounded-xl cdx-border cdx-cursor-pointer cdx-transition-all ${
                    smartLens.triggerMode === mode.value
                      ? 'cdx-border-purple-500 cdx-bg-purple-50 dark:cdx-bg-purple-900/20'
                      : 'cdx-border-neutral-200 dark:cdx-border-neutral-700 hover:cdx-border-neutral-300 dark:hover:cdx-border-neutral-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="triggerMode"
                    value={mode.value}
                    checked={smartLens.triggerMode === mode.value}
                    onChange={(e) => updateSmartLens('triggerMode', e.target.value)}
                    className="cdx-sr-only"
                  />
                  <div className={`cdx-w-4 cdx-h-4 cdx-rounded-full cdx-border-2 cdx-flex cdx-items-center cdx-justify-center ${
                    smartLens.triggerMode === mode.value
                      ? 'cdx-border-purple-500'
                      : 'cdx-border-neutral-300 dark:cdx-border-neutral-600'
                  }`}>
                    {smartLens.triggerMode === mode.value && (
                      <div className="cdx-w-2 cdx-h-2 cdx-rounded-full cdx-bg-purple-500" />
                    )}
                  </div>
                  <div className="cdx-flex-1">
                    <div className="cdx-flex cdx-items-center cdx-gap-2">
                      <span className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-200">
                        {mode.label}
                      </span>
                      {mode.recommended && (
                        <span className="cdx-text-xs cdx-px-1.5 cdx-py-0.5 cdx-rounded cdx-bg-purple-100 dark:cdx-bg-purple-900/50 cdx-text-purple-600 dark:cdx-text-purple-400">
                          推荐
                        </span>
                      )}
                    </div>
                    <span className="cdx-text-xs cdx-text-neutral-500">{mode.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </FieldWrapper>

          {smartLens.triggerMode === 'hover' && (
            <FieldWrapper title="悬停延迟" description="显示预览前的等待时间">
              <div className="cdx-flex cdx-items-center cdx-gap-4">
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={smartLens.hoverDelay}
                  onChange={(e) => updateSmartLens('hoverDelay', Number(e.target.value))}
                  className="cdx-flex-1 cdx-h-2 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-appearance-none cdx-cursor-pointer"
                />
                <span className="cdx-text-sm cdx-font-mono cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-w-16 cdx-text-right">
                  {(smartLens.hoverDelay / 1000).toFixed(1)}s
                </span>
              </div>
            </FieldWrapper>
          )}

          <FieldWrapper title="默认预览模式" description="选择默认显示方式" row>
            <select
              value={smartLens.defaultPreviewMode || 'iframe'}
              onChange={(e) => updateSmartLens('defaultPreviewMode', e.target.value)}
              className="input cdx-w-40"
            >
              <option value="iframe">🖥️ 完整预览</option>
              <option value="metadata">📄 信息摘要</option>
            </select>
          </FieldWrapper>

          <FieldWrapper title="显示视觉暗示" description="链接旁显示预览图标" row>
            <Switch.Root
              checked={smartLens.showVisualCue}
              onCheckedChange={(checked: boolean) => updateSmartLens('showVisualCue', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          <FieldWrapper title="AI 智能摘要" description="使用 AI 生成内容摘要" row>
            <Switch.Root
              checked={smartLens.enableAISummary}
              onCheckedChange={(checked: boolean) => updateSmartLens('enableAISummary', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          <FieldWrapper title="钉住功能" description="将预览固定在屏幕上" row>
            <Switch.Root
              checked={smartLens.enablePinMode}
              onCheckedChange={(checked: boolean) => updateSmartLens('enablePinMode', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          <FieldWrapper title="排除域名" description="这些网站不显示预览">
            <textarea
              value={smartLens.excludedDomains.join('\n')}
              onChange={(e) =>
                updateSmartLens(
                  'excludedDomains',
                  e.target.value.split('\n').filter((d) => d.trim())
                )
              }
              placeholder="example.com&#10;localhost"
              className="input cdx-font-mono cdx-text-sm cdx-resize-none"
              rows={3}
            />
          </FieldWrapper>

          <div className="cdx-mt-4 cdx-p-4 cdx-bg-gradient-to-r cdx-from-purple-50 cdx-to-pink-50 dark:cdx-from-purple-900/20 dark:cdx-to-pink-900/20 cdx-rounded-xl cdx-border cdx-border-purple-100 dark:cdx-border-purple-800/50">
            <div className="cdx-flex cdx-items-start cdx-gap-3">
              <HiOutlineLightBulb className="cdx-text-purple-500 cdx-text-lg cdx-mt-0.5" />
              <div>
                <h4 className="cdx-text-sm cdx-font-medium cdx-text-purple-900 dark:cdx-text-purple-100">
                  使用技巧
                </h4>
                <ul className="cdx-text-xs cdx-text-purple-700 dark:cdx-text-purple-300 cdx-mt-2 cdx-space-y-1">
                  <li>• 推荐使用 Space 键模式，避免误触</li>
                  <li>• 支持文章、视频、GitHub 仓库等内容</li>
                  <li>• AI 摘要会消耗额外 API 调用</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
