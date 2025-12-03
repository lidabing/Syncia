/**
 * Smart Lens Settings Section
 */

import React from 'react'
import { useSettings } from '../../../hooks/useSettings'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'
import { DEFAULT_SMART_LENS_SETTINGS } from '../../../config/settings/smartLens'

export const SmartLensSettings = () => {
  const [settings, setSettings] = useSettings()

  // 使用默认值以防 smartLens 未定义
  const smartLens = settings.smartLens || DEFAULT_SMART_LENS_SETTINGS

  const updateSmartLens = (key: string, value: any) => {
    setSettings({
      ...settings,
      smartLens: {
        ...smartLens,
        [key]: value,
      },
    })
  }

  return (
    <div>
      <SectionHeading title="智能预览透镜 (Smart Lens)" />
      <p className="cdx-text-sm cdx-text-neutral-400 cdx-mb-4">
        在不打断阅读流的前提下，即时预览链接内容
      </p>

      <FieldWrapper title="启用 Smart Lens" description="鼠标悬停在链接上时显示智能预览卡片">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={smartLens?.enabled ?? false}
            onChange={(e) => updateSmartLens('enabled', e.target.checked)}
            className="mr-2"
          />
          <span>启用</span>
        </label>
      </FieldWrapper>

      {smartLens?.enabled && (
        <>
          <FieldWrapper title="触发模式" description="选择如何触发预览卡片">
            <select
              value={smartLens.triggerMode}
              onChange={(e) => updateSmartLens('triggerMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="space">
                悬停 + Space 键 (推荐 - 类似 macOS Quick Look)
              </option>
              <option value="hover">自动悬停 (带延迟)</option>
              <option value="shift-hover">悬停 + Shift 键</option>
            </select>
          </FieldWrapper>

          {smartLens.triggerMode === 'hover' && (
            <FieldWrapper title="悬停延迟" description="鼠标悬停多久后显示预览 (毫秒)">
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={smartLens.hoverDelay}
                onChange={(e) =>
                  updateSmartLens('hoverDelay', Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500 mt-1">
                当前: {smartLens.hoverDelay}ms ({(smartLens.hoverDelay / 1000).toFixed(1)}秒)
              </span>
            </FieldWrapper>
          )}

          <FieldWrapper title="显示视觉暗示" description="在可预览的链接旁显示小图标">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smartLens.showVisualCue}
                onChange={(e) =>
                  updateSmartLens('showVisualCue', e.target.checked)
                }
                className="mr-2"
              />
              <span>显示暗示图标</span>
            </label>
          </FieldWrapper>

          <FieldWrapper title="AI 智能摘要" description="使用 AI 生成文章摘要 (需要 OpenAI API Key)">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smartLens.enableAISummary}
                onChange={(e) =>
                  updateSmartLens('enableAISummary', e.target.checked)
                }
                className="mr-2"
              />
              <span>启用 AI 摘要</span>
            </label>
          </FieldWrapper>

          <FieldWrapper title="钉住模式" description="允许将预览卡片固定在屏幕角落">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smartLens.enablePinMode}
                onChange={(e) =>
                  updateSmartLens('enablePinMode', e.target.checked)
                }
                className="mr-2"
              />
              <span>启用钉住功能</span>
            </label>
          </FieldWrapper>

          <FieldWrapper title="卡片最大宽度" description="预览卡片的最大宽度 (像素)">
            <input
              type="number"
              min="300"
              max="600"
              step="50"
              value={smartLens.maxWidth}
              onChange={(e) =>
                updateSmartLens('maxWidth', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
          </FieldWrapper>

          <FieldWrapper title="默认预览模式" description="选择默认的预览显示方式">
            <select
              value={smartLens.defaultPreviewMode || 'iframe'}
              onChange={(e) => updateSmartLens('defaultPreviewMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="iframe">🖥️ 完整预览 (推荐) - 显示完整网页</option>
              <option value="metadata">📄 信息摘要 - 仅显示标题和描述</option>
            </select>
          </FieldWrapper>

          <FieldWrapper title="排除域名" description="这些网站不会显示预览 (每行一个域名)">
            <textarea
              value={smartLens.excludedDomains.join('\n')}
              onChange={(e) =>
                updateSmartLens(
                  'excludedDomains',
                  e.target.value.split('\n').filter((d) => d.trim())
                )
              }
              placeholder="example.com&#10;localhost&#10;192.168.*"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 font-mono text-sm"
              rows={5}
            />
          </FieldWrapper>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 使用提示
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>推荐使用 "悬停 + Space 键" 模式，避免误触</li>
              <li>支持文章、视频、GitHub 仓库等多种内容类型</li>
              <li>钉住模式可以让你边看预览边浏览主页面</li>
              <li>AI 摘要会消耗额外的 API 调用</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
