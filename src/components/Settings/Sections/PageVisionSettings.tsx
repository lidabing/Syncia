/**
 * Page Vision Settings Section
 * 页面智能识别功能设置
 */

import React from 'react'
import * as Switch from '@radix-ui/react-switch'
import { useSettings } from '../../../hooks/useSettings'
import { useLanguage } from '../../../hooks/useLanguage'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'
import { DEFAULT_PAGE_VISION_SETTINGS } from '../../../config/settings/pageVision'
import { HiOutlineCamera, HiOutlineSparkles } from 'react-icons/hi'

export const PageVisionSettings = () => {
  const [settings, setSettings] = useSettings()
  const { t } = useLanguage()

  // Use default values in case pageVision is undefined
  const pageVision = settings.pageVision || DEFAULT_PAGE_VISION_SETTINGS

  const updatePageVision = (key: string, value: boolean | string | number | string[]) => {
    setSettings({
      ...settings,
      pageVision: {
        ...pageVision,
        [key]: value,
      },
    })
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title="智能识别"
        icon={<HiOutlineSparkles />}
        description="使用 AI 视觉能力分析当前页面，推测您的需求并提供操作建议"
      />

      <FieldWrapper 
        title="启用智能识别"
        description="开启后，可在侧边栏使用 AI 识别页面功能"
        row
      >
        <Switch.Root
          checked={pageVision?.enabled ?? true}
          onCheckedChange={(checked: boolean) => updatePageVision('enabled', checked)}
          className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
        >
          <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
        </Switch.Root>
      </FieldWrapper>

      {pageVision?.enabled && (
        <>
          <FieldWrapper 
            title="使用页面截图"
            description="启用多模态分析，发送页面截图给 AI（需要支持视觉的模型）"
            row
          >
            <Switch.Root
              checked={pageVision.useScreenshot}
              onCheckedChange={(checked: boolean) => updatePageVision('useScreenshot', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          {pageVision.useScreenshot && (
            <>
              <FieldWrapper 
                title="压缩图片"
                description="发送前压缩截图以减少 Token 消耗"
                row
              >
                <Switch.Root
                  checked={pageVision.compressImage}
                  onCheckedChange={(checked: boolean) => updatePageVision('compressImage', checked)}
                  className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
                >
                  <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
                </Switch.Root>
              </FieldWrapper>

              <FieldWrapper 
                title="图片质量"
                description="压缩后的图片质量（越高质量越好，但 Token 消耗也越多）"
              >
                <div className="cdx-flex cdx-items-center cdx-gap-4">
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={pageVision.imageQuality}
                    onChange={(e) => updatePageVision('imageQuality', Number(e.target.value))}
                    className="cdx-flex-1 cdx-h-2 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-appearance-none cdx-cursor-pointer"
                  />
                  <span className="cdx-text-sm cdx-font-mono cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-w-12 cdx-text-right">
                    {Math.round(pageVision.imageQuality * 100)}%
                  </span>
                </div>
              </FieldWrapper>

              <FieldWrapper 
                title="最大图片宽度"
                description="图片会被缩放到此宽度以内"
              >
                <div className="cdx-flex cdx-items-center cdx-gap-4">
                  <input
                    type="range"
                    min="640"
                    max="1920"
                    step="64"
                    value={pageVision.maxImageWidth}
                    onChange={(e) => updatePageVision('maxImageWidth', Number(e.target.value))}
                    className="cdx-flex-1 cdx-h-2 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-appearance-none cdx-cursor-pointer"
                  />
                  <span className="cdx-text-sm cdx-font-mono cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-w-16 cdx-text-right">
                    {pageVision.maxImageWidth}px
                  </span>
                </div>
              </FieldWrapper>
            </>
          )}

          <FieldWrapper 
            title="缓存分析结果"
            description="缓存页面分析结果，避免重复调用 API"
            row
          >
            <Switch.Root
              checked={pageVision.cacheResults}
              onCheckedChange={(checked: boolean) => updatePageVision('cacheResults', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          {pageVision.cacheResults && (
            <FieldWrapper 
              title="缓存时长"
              description="分析结果缓存的有效期"
            >
              <div className="cdx-flex cdx-items-center cdx-gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={pageVision.cacheDuration}
                  onChange={(e) => updatePageVision('cacheDuration', Number(e.target.value))}
                  className="cdx-flex-1 cdx-h-2 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-appearance-none cdx-cursor-pointer"
                />
                <span className="cdx-text-sm cdx-font-mono cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-w-16 cdx-text-right">
                  {pageVision.cacheDuration} 分钟
                </span>
              </div>
            </FieldWrapper>
          )}

          <FieldWrapper 
            title="敏感内容警告"
            description="在检测到可能包含密码、银行等敏感信息的页面时显示警告"
            row
          >
            <Switch.Root
              checked={pageVision.sensitiveContentWarning}
              onCheckedChange={(checked: boolean) => updatePageVision('sensitiveContentWarning', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          <FieldWrapper 
            title="自动分析"
            description="打开侧边栏时自动分析当前页面（可能会消耗更多 API 调用）"
            row
          >
            <Switch.Root
              checked={pageVision.autoAnalyze}
              onCheckedChange={(checked: boolean) => updatePageVision('autoAnalyze', checked)}
              className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-purple-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
            >
              <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
            </Switch.Root>
          </FieldWrapper>

          <div className="cdx-mt-4 cdx-p-3 cdx-rounded-lg cdx-bg-blue-50 dark:cdx-bg-blue-900/20 cdx-border cdx-border-blue-200 dark:cdx-border-blue-800">
            <div className="cdx-flex cdx-items-start cdx-gap-2">
              <HiOutlineCamera className="cdx-w-5 cdx-h-5 cdx-text-blue-500 cdx-flex-shrink-0 cdx-mt-0.5" />
              <div>
                <p className="cdx-text-sm cdx-font-medium cdx-text-blue-700 dark:cdx-text-blue-300">
                  使用提示
                </p>
                <p className="cdx-text-xs cdx-text-blue-600 dark:cdx-text-blue-400 cdx-mt-1">
                  点击侧边栏中的「智能识别页面」按钮，AI 将分析当前页面内容并提供个性化的操作建议。
                  需要使用支持视觉能力的模型（如 GPT-4o、Claude 3.5 Sonnet 等）以获得最佳效果。
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PageVisionSettings
