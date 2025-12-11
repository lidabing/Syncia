/**
 * PageVisionSuggestions Component
 * 
 * 显示 AI 页面识别结果和操作建议
 */

import React, { useState } from 'react'
import { 
  HiOutlineSparkles, 
  HiOutlineRefresh, 
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCamera,
  HiOutlineEye,
  HiOutlineExclamation,
} from 'react-icons/hi'
import { 
  FiShoppingBag, 
  FiCode, 
  FiFileText, 
  FiVideo, 
  FiMessageCircle,
  FiGrid,
  FiEdit3,
  FiSearch,
  FiGlobe,
  FiBook,
} from 'react-icons/fi'
import { usePageVision, UsePageVisionReturn } from '../../../hooks/usePageVision'
import type { PageCategory, SuggestedAction } from '../../../config/settings/pageVision'
import { useLanguage } from '../../../hooks/useLanguage'

// 页面类别图标映射
const CATEGORY_ICONS: Record<PageCategory, React.ReactNode> = {
  ecommerce: <FiShoppingBag className="cdx-w-4 cdx-h-4" />,
  coding: <FiCode className="cdx-w-4 cdx-h-4" />,
  article: <FiFileText className="cdx-w-4 cdx-h-4" />,
  documentation: <FiBook className="cdx-w-4 cdx-h-4" />,
  social: <FiMessageCircle className="cdx-w-4 cdx-h-4" />,
  video: <FiVideo className="cdx-w-4 cdx-h-4" />,
  dashboard: <FiGrid className="cdx-w-4 cdx-h-4" />,
  form: <FiEdit3 className="cdx-w-4 cdx-h-4" />,
  search: <FiSearch className="cdx-w-4 cdx-h-4" />,
  general: <FiGlobe className="cdx-w-4 cdx-h-4" />,
}

// 页面类别中文名
const CATEGORY_LABELS: Record<PageCategory, string> = {
  ecommerce: '电商',
  coding: '代码',
  article: '文章',
  documentation: '文档',
  social: '社交',
  video: '视频',
  dashboard: '面板',
  form: '表单',
  search: '搜索',
  general: '通用',
}

interface PageVisionSuggestionsProps {
  onSelectAction: (query: string) => void
  pageVision: UsePageVisionReturn
}

const PageVisionSuggestions: React.FC<PageVisionSuggestionsProps> = ({ onSelectAction, pageVision }) => {
  const { t } = useLanguage()
  const { 
    result, 
    isAnalyzing, 
    error, 
    hasAnalyzed,
    currentScreenshot,
    analyzeCurrentPage, 
    settings 
  } = pageVision
  
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  console.log('[PageVisionSuggestions] Rendered with:', { 
    enabled: settings.enabled, 
    isAnalyzing, 
    hasResult: !!result, 
    hasError: !!error,
    hasScreenshot: !!currentScreenshot,
    isExpanded,
    showSuggestions
  })

  // 如果功能未启用，不渲染
  if (!settings.enabled) {
    console.log('[PageVisionSuggestions] Feature disabled, not rendering')
    return null
  }

  // 处理操作点击
  const handleActionClick = (action: SuggestedAction) => {
    console.log('[PageVisionSuggestions] Action clicked:', action)
    onSelectAction(action.query)
  }

  // 刷新分析
  const handleRefresh = () => {
    analyzeCurrentPage(true)
  }

  // 加载状态
  const renderLoading = () => (
    <div className="cdx-flex cdx-flex-col cdx-items-center cdx-justify-center cdx-py-6 cdx-gap-3">
      {currentScreenshot && (
        <div className="cdx-w-full cdx-mb-2 cdx-rounded-lg cdx-overflow-hidden cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-opacity-50">
           <img 
             src={currentScreenshot.startsWith('data:') ? currentScreenshot : `data:image/jpeg;base64,${currentScreenshot}`} 
             alt="Analyzing Screenshot" 
             className="cdx-w-full cdx-h-auto cdx-object-cover cdx-max-h-48"
           />
        </div>
      )}
      <div className="cdx-relative">
        <div className="cdx-w-12 cdx-h-12 cdx-border-4 cdx-border-purple-200 dark:cdx-border-purple-900 cdx-rounded-full cdx-animate-pulse" />
        <div className="cdx-absolute cdx-inset-0 cdx-flex cdx-items-center cdx-justify-center">
          <HiOutlineEye className="cdx-w-6 cdx-h-6 cdx-text-purple-500 cdx-animate-pulse" />
        </div>
      </div>
      <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400">
        正在分析页面...
      </p>
      <p className="cdx-text-xs cdx-text-neutral-400 dark:cdx-text-neutral-500">
        识别内容并推测您的需求
      </p>
    </div>
  )

  // 错误状态
  const renderError = () => (
    <div className="cdx-flex cdx-flex-col cdx-items-center cdx-py-4 cdx-gap-2">
      {currentScreenshot && (
        <div className="cdx-w-full cdx-mb-2 cdx-rounded-lg cdx-overflow-hidden cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-opacity-50">
           <img 
             src={currentScreenshot.startsWith('data:') ? currentScreenshot : `data:image/jpeg;base64,${currentScreenshot}`} 
             alt="Failed Screenshot" 
             className="cdx-w-full cdx-h-auto cdx-object-cover cdx-max-h-48"
           />
        </div>
      )}
      <HiOutlineExclamation className="cdx-w-8 cdx-h-8 cdx-text-amber-500" />
      <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400">
        分析失败
      </p>
      <p className="cdx-text-xs cdx-text-neutral-400 dark:cdx-text-neutral-500 cdx-text-center cdx-px-4">
        {error?.message || '请稍后重试'}
      </p>
      <button
        type="button"
        onClick={handleRefresh}
        className="cdx-mt-2 cdx-text-sm cdx-text-purple-500 hover:cdx-text-purple-600 cdx-flex cdx-items-center cdx-gap-1"
      >
        <HiOutlineRefresh className="cdx-w-4 cdx-h-4" />
        重试
      </button>
    </div>
  )

  // 分析结果
  const renderResult = () => {
    if (!result) return null

    const primaryActions = result.actions.filter(a => a.category === 'primary').slice(0, 2)
    const secondaryActions = result.actions.filter(a => a.category !== 'primary')

    return (
      <div className="cdx-flex cdx-flex-col cdx-gap-3">
        {/* 页面摘要 */}
        <div className="cdx-flex cdx-items-start cdx-gap-3 cdx-p-3 cdx-bg-neutral-50 dark:cdx-bg-neutral-800/50 cdx-rounded-xl">
          <div className="cdx-flex-shrink-0 cdx-w-8 cdx-h-8 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-lg cdx-bg-gradient-to-br cdx-from-purple-500 cdx-to-indigo-600 cdx-text-white">
            {CATEGORY_ICONS[result.pageCategory]}
          </div>
          <div className="cdx-flex-1 cdx-min-w-0">
            <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-mb-1">
              <span className="cdx-text-xs cdx-px-2 cdx-py-0.5 cdx-rounded-full cdx-bg-purple-100 dark:cdx-bg-purple-900/30 cdx-text-purple-600 dark:cdx-text-purple-400 cdx-font-medium">
                {CATEGORY_LABELS[result.pageCategory]}
              </span>
              {result.metadata?.sensitiveContent && (
                <span className="cdx-text-xs cdx-px-2 cdx-py-0.5 cdx-rounded-full cdx-bg-amber-100 dark:cdx-bg-amber-900/30 cdx-text-amber-600 dark:cdx-text-amber-400">
                  ⚠️ 敏感
                </span>
              )}
              {/* 显示是否使用了视觉分析 */}
              {result.metadata?.visionModelUsed === false && (
                <span className="cdx-text-xs cdx-px-2 cdx-py-0.5 cdx-rounded-full cdx-bg-orange-100 dark:cdx-bg-orange-900/30 cdx-text-orange-600 dark:cdx-text-orange-400" title="当前模型不支持图片分析，建议使用 GPT-4o 等视觉模型">
                  📝 纯文本
                </span>
              )}
            </div>
            <p className="cdx-text-sm cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-line-clamp-2">
              {result.pageSummary}
            </p>
            
            {/* Screenshot Preview - 直接显示在主界面 */}
            {(result.screenshotUrl || currentScreenshot) && (
              <div className="cdx-mt-2 cdx-rounded-lg cdx-overflow-hidden cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700">
                <img 
                  src={
                    (result.screenshotUrl || currentScreenshot || '').startsWith('data:') 
                      ? (result.screenshotUrl || currentScreenshot || '') 
                      : `data:image/jpeg;base64,${result.screenshotUrl || currentScreenshot || ''}`
                  } 
                  alt="Page Screenshot" 
                  className="cdx-w-full cdx-h-auto cdx-object-cover cdx-max-h-40"
                />
              </div>
            )}
            
            {/* 展开详情 */}
            {showDetails && (
              <div className="cdx-mt-2 cdx-pt-2 cdx-border-t cdx-border-neutral-200 dark:cdx-border-neutral-700">
                <p className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mb-2">
                  {result.reasoning}
                </p>
                {result.keyElements.length > 0 && (
                  <div className="cdx-flex cdx-flex-wrap cdx-gap-1">
                    {result.keyElements.map((element, index) => (
                      <span 
                        key={index}
                        className="cdx-text-xs cdx-px-2 cdx-py-0.5 cdx-rounded cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-text-neutral-600 dark:cdx-text-neutral-400"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="cdx-mt-2 cdx-flex cdx-items-center cdx-gap-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="cdx-text-xs cdx-text-neutral-400 hover:cdx-text-neutral-600 dark:hover:cdx-text-neutral-300 cdx-flex cdx-items-center cdx-gap-0.5"
              >
                {showDetails ? (
                  <>收起详情 <HiOutlineChevronUp className="cdx-w-3 cdx-h-3" /></>
                ) : (
                  <>查看详情 <HiOutlineChevronDown className="cdx-w-3 cdx-h-3" /></>
                )}
              </button>
              <span className="cdx-text-neutral-300 dark:cdx-text-neutral-600">|</span>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="cdx-text-xs cdx-text-purple-500 hover:cdx-text-purple-600 dark:hover:cdx-text-purple-400 cdx-flex cdx-items-center cdx-gap-0.5 cdx-font-medium"
              >
                {showSuggestions ? (
                  <>收起推荐 <HiOutlineChevronUp className="cdx-w-3 cdx-h-3" /></>
                ) : (
                  <>查看推荐 ({primaryActions.length + secondaryActions.length}) <HiOutlineChevronDown className="cdx-w-3 cdx-h-3" /></>
                )}
              </button>
            </div>
          </div>
          
          {/* 刷新按钮 */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isAnalyzing}
            className="cdx-flex-shrink-0 cdx-p-1.5 cdx-rounded-lg cdx-text-neutral-400 hover:cdx-text-neutral-600 dark:hover:cdx-text-neutral-300 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 cdx-transition-colors disabled:cdx-opacity-50"
            title="重新分析"
          >
            <HiOutlineRefresh className={`cdx-w-4 cdx-h-4 ${isAnalyzing ? 'cdx-animate-spin' : ''}`} />
          </button>
        </div>

        {/* 推荐操作 - 只有点击展开才显示 */}
        {showSuggestions && (
          <div className="cdx-flex cdx-flex-col cdx-gap-3">
            {/* 主要操作 */}
            {primaryActions.length > 0 && (
          <div className="cdx-grid cdx-grid-cols-2 cdx-gap-2">
            {primaryActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionClick(action)}
                className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-1.5 cdx-px-3 cdx-py-2.5 cdx-rounded-xl cdx-bg-gradient-to-r cdx-from-purple-500 cdx-to-indigo-600 hover:cdx-from-purple-600 hover:cdx-to-indigo-700 cdx-text-white cdx-text-sm cdx-font-medium cdx-transition-all cdx-shadow-sm hover:cdx-shadow"
              >
                <HiOutlineSparkles className="cdx-w-4 cdx-h-4" />
                {action.label}
              </button>
            ))}
          </div>
        )}

            {/* 次要操作 */}
            {secondaryActions.length > 0 && (
              <div className="cdx-flex cdx-flex-wrap cdx-gap-2">
                {secondaryActions.slice(0, 4).map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleActionClick(action)}
                    className="cdx-px-3 cdx-py-1.5 cdx-rounded-lg cdx-bg-neutral-100 dark:cdx-bg-neutral-800 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-text-sm cdx-transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="cdx-px-4 cdx-py-3 cdx-border-b cdx-border-neutral-200 dark:cdx-border-neutral-800">
      {/* 折叠头部 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="cdx-w-full cdx-flex cdx-items-center cdx-justify-between cdx-mb-2"
      >
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <HiOutlineSparkles className="cdx-w-4 cdx-h-4 cdx-text-purple-500" />
          <span className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-300">
            智能识别
          </span>
          {result && (
            <span className="cdx-text-xs cdx-text-neutral-400">
              {result.screenshotUsed ? '📷' : '📝'}
            </span>
          )}
        </div>
        {isExpanded ? (
          <HiOutlineChevronUp className="cdx-w-4 cdx-h-4 cdx-text-neutral-400" />
        ) : (
          <HiOutlineChevronDown className="cdx-w-4 cdx-h-4 cdx-text-neutral-400" />
        )}
      </button>

      {/* 内容区域 */}
      {isExpanded && (
        <div className="cdx-mt-2">
          {isAnalyzing && !result ? (
            renderLoading()
          ) : error && !result ? (
            renderError()
          ) : result ? (
            renderResult()
          ) : null}
        </div>
      )}
    </div>
  )
}

export default PageVisionSuggestions
