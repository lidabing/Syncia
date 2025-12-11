/**
 * Page Vision Tab - 独立的智能页面识别视图
 * 
 * 提供完整的页面分析界面，包括截图预览、分析结果和操作建议
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
import { usePageVision } from '../../../hooks/usePageVision'
import type { PageCategory, SuggestedAction } from '../../../config/settings/pageVision'

// 页面类别图标映射
const CATEGORY_ICONS: Record<PageCategory, React.ReactNode> = {
  ecommerce: <FiShoppingBag className="cdx-w-5 cdx-h-5" />,
  coding: <FiCode className="cdx-w-5 cdx-h-5" />,
  article: <FiFileText className="cdx-w-5 cdx-h-5" />,
  documentation: <FiBook className="cdx-w-5 cdx-h-5" />,
  social: <FiMessageCircle className="cdx-w-5 cdx-h-5" />,
  video: <FiVideo className="cdx-w-5 cdx-h-5" />,
  dashboard: <FiGrid className="cdx-w-5 cdx-h-5" />,
  form: <FiEdit3 className="cdx-w-5 cdx-h-5" />,
  search: <FiSearch className="cdx-w-5 cdx-h-5" />,
  general: <FiGlobe className="cdx-w-5 cdx-h-5" />,
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

interface PageVisionViewProps {
  onSelectAction: (query: string) => void
}

const PageVisionView: React.FC<PageVisionViewProps> = ({ onSelectAction }) => {
  const pageVision = usePageVision()
  const { 
    result, 
    isAnalyzing, 
    error, 
    hasAnalyzed,
    currentScreenshot,
    analyzeCurrentPage, 
    settings 
  } = pageVision
  
  const [showDetails, setShowDetails] = useState(true)

  // 处理操作点击
  const handleActionClick = (action: SuggestedAction) => {
    onSelectAction(action.query)
  }

  // 加载状态
  const renderLoading = () => (
    <div className="cdx-flex cdx-flex-col cdx-items-center cdx-justify-center cdx-py-16 cdx-gap-4">
      {currentScreenshot && (
        <div className="cdx-w-full cdx-max-w-2xl cdx-mb-4 cdx-rounded-xl cdx-overflow-hidden cdx-border-2 cdx-border-purple-200 dark:cdx-border-purple-700 cdx-opacity-50">
           <img 
             src={currentScreenshot.startsWith('data:') ? currentScreenshot : `data:image/jpeg;base64,${currentScreenshot}`} 
             alt="Analyzing Screenshot" 
             className="cdx-w-full cdx-h-auto cdx-object-cover"
           />
        </div>
      )}
      <div className="cdx-relative">
        <div className="cdx-w-16 cdx-h-16 cdx-border-4 cdx-border-purple-200 dark:cdx-border-purple-900 cdx-rounded-full cdx-animate-pulse" />
        <div className="cdx-absolute cdx-inset-0 cdx-flex cdx-items-center cdx-justify-center">
          <HiOutlineEye className="cdx-w-8 cdx-h-8 cdx-text-purple-500 cdx-animate-pulse" />
        </div>
      </div>
      <div className="cdx-text-center">
        <p className="cdx-text-base cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-mb-1">
          正在分析页面...
        </p>
        <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400">
          识别内容并推测您的需求
        </p>
      </div>
    </div>
  )

  // 错误状态
  const renderError = () => (
    <div className="cdx-flex cdx-flex-col cdx-items-center cdx-py-16 cdx-gap-4">
      {currentScreenshot && (
        <div className="cdx-w-full cdx-max-w-2xl cdx-mb-4 cdx-rounded-xl cdx-overflow-hidden cdx-border-2 cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-opacity-50">
           <img 
             src={currentScreenshot.startsWith('data:') ? currentScreenshot : `data:image/jpeg;base64,${currentScreenshot}`} 
             alt="Failed Screenshot" 
             className="cdx-w-full cdx-h-auto cdx-object-cover"
           />
        </div>
      )}
      <HiOutlineExclamation className="cdx-w-12 cdx-h-12 cdx-text-amber-500" />
      <div className="cdx-text-center">
        <p className="cdx-text-base cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-mb-1">
          分析失败
        </p>
        <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400">
          {error?.message || '请稍后重试'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => analyzeCurrentPage(true)}
        className="cdx-mt-4 cdx-px-6 cdx-py-2.5 cdx-rounded-lg cdx-bg-purple-500 hover:cdx-bg-purple-600 cdx-text-white cdx-font-medium cdx-flex cdx-items-center cdx-gap-2 cdx-transition-colors"
      >
        <HiOutlineRefresh className="cdx-w-5 cdx-h-5" />
        重试
      </button>
    </div>
  )

  // 空状态 - 未开始分析
  const renderEmpty = () => (
    <div className="cdx-flex cdx-flex-col cdx-items-center cdx-justify-center cdx-py-20 cdx-gap-6">
      <div className="cdx-w-20 cdx-h-20 cdx-rounded-full cdx-bg-gradient-to-br cdx-from-purple-100 cdx-to-indigo-100 dark:cdx-from-purple-900/30 dark:cdx-to-indigo-900/30 cdx-flex cdx-items-center cdx-justify-center">
        <HiOutlineCamera className="cdx-w-10 cdx-h-10 cdx-text-purple-500" />
      </div>
      <div className="cdx-text-center cdx-max-w-md">
        <h3 className="cdx-text-lg cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-neutral-200 cdx-mb-2">
          智能识别页面
        </h3>
        <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mb-6">
          使用 AI 视觉能力分析当前页面，自动识别页面类型、推测您的需求，并提供智能操作建议
        </p>
        <button
          type="button"
          onClick={() => analyzeCurrentPage()}
          className="cdx-px-6 cdx-py-3 cdx-rounded-xl cdx-bg-gradient-to-r cdx-from-purple-500 cdx-to-indigo-600 hover:cdx-from-purple-600 hover:cdx-to-indigo-700 cdx-text-white cdx-font-medium cdx-flex cdx-items-center cdx-gap-2 cdx-mx-auto cdx-transition-all cdx-shadow-lg hover:cdx-shadow-xl"
        >
          <HiOutlineSparkles className="cdx-w-5 cdx-h-5" />
          开始分析
        </button>
      </div>
    </div>
  )

  // 分析结果
  const renderResult = () => {
    if (!result) return null

    const primaryActions = result.actions.filter(a => a.category === 'primary')
    const secondaryActions = result.actions.filter(a => a.category !== 'primary')

    return (
      <div className="cdx-flex cdx-flex-col cdx-gap-6 cdx-p-6">
        {/* 截图预览 */}
        {(result.screenshotUrl || currentScreenshot) && (
          <div className="cdx-rounded-xl cdx-overflow-hidden cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-shadow-lg">
            <img 
              src={
                (result.screenshotUrl || currentScreenshot || '').startsWith('data:') 
                  ? (result.screenshotUrl || currentScreenshot || '') 
                  : `data:image/jpeg;base64,${result.screenshotUrl || currentScreenshot || ''}`
              } 
              alt="Page Screenshot" 
              className="cdx-w-full cdx-h-auto cdx-object-cover"
            />
          </div>
        )}

        {/* 页面摘要卡片 */}
        <div className="cdx-rounded-xl cdx-bg-gradient-to-br cdx-from-purple-50 cdx-to-indigo-50 dark:cdx-from-purple-900/20 dark:cdx-to-indigo-900/20 cdx-p-6 cdx-border cdx-border-purple-100 dark:cdx-border-purple-800">
          <div className="cdx-flex cdx-items-start cdx-gap-4 cdx-mb-4">
            <div className="cdx-flex-shrink-0 cdx-w-12 cdx-h-12 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-xl cdx-bg-gradient-to-br cdx-from-purple-500 cdx-to-indigo-600 cdx-text-white cdx-shadow-md">
              {CATEGORY_ICONS[result.pageCategory]}
            </div>
            <div className="cdx-flex-1">
              <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-mb-2">
                <span className="cdx-text-sm cdx-px-3 cdx-py-1 cdx-rounded-full cdx-bg-purple-500 cdx-text-white cdx-font-medium">
                  {CATEGORY_LABELS[result.pageCategory]}
                </span>
                {result.metadata?.sensitiveContent && (
                  <span className="cdx-text-xs cdx-px-2 cdx-py-1 cdx-rounded-full cdx-bg-amber-100 dark:cdx-bg-amber-900/30 cdx-text-amber-600 dark:cdx-text-amber-400">
                    ⚠️ 敏感内容
                  </span>
                )}
                {result.metadata?.visionModelUsed === false && (
                  <span className="cdx-text-xs cdx-px-2 cdx-py-1 cdx-rounded-full cdx-bg-orange-100 dark:cdx-bg-orange-900/30 cdx-text-orange-600 dark:cdx-text-orange-400" title="当前模型不支持图片分析">
                    📝 纯文本
                  </span>
                )}
              </div>
              <p className="cdx-text-base cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-leading-relaxed">
                {result.pageSummary}
              </p>
            </div>
            
            {/* 刷新按钮 */}
            <button
              type="button"
              onClick={() => analyzeCurrentPage(true)}
              disabled={isAnalyzing}
              className="cdx-flex-shrink-0 cdx-p-2 cdx-rounded-lg cdx-text-neutral-500 hover:cdx-text-purple-600 dark:hover:cdx-text-purple-400 hover:cdx-bg-white dark:hover:cdx-bg-neutral-800 cdx-transition-colors disabled:cdx-opacity-50"
              title="重新分析"
            >
              <HiOutlineRefresh className={`cdx-w-5 cdx-h-5 ${isAnalyzing ? 'cdx-animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* 展开详情 */}
          <div className="cdx-mt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="cdx-text-sm cdx-text-purple-600 dark:cdx-text-purple-400 hover:cdx-text-purple-700 dark:hover:cdx-text-purple-300 cdx-flex cdx-items-center cdx-gap-1 cdx-font-medium"
            >
              {showDetails ? (
                <>收起详情 <HiOutlineChevronUp className="cdx-w-4 cdx-h-4" /></>
              ) : (
                <>查看详情 <HiOutlineChevronDown className="cdx-w-4 cdx-h-4" /></>
              )}
            </button>
            
            {showDetails && (
              <div className="cdx-mt-4 cdx-pt-4 cdx-border-t cdx-border-purple-200 dark:cdx-border-purple-700">
                <p className="cdx-text-sm cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-mb-3">
                  {result.reasoning}
                </p>
                {result.keyElements.length > 0 && (
                  <div className="cdx-flex cdx-flex-wrap cdx-gap-2">
                    {result.keyElements.map((element, index) => (
                      <span 
                        key={index}
                        className="cdx-text-xs cdx-px-3 cdx-py-1 cdx-rounded-full cdx-bg-white dark:cdx-bg-neutral-800 cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 推荐操作 */}
        <div className="cdx-space-y-4">
          <h3 className="cdx-text-base cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-neutral-200">
            推荐操作
          </h3>
          
          {/* 主要操作 */}
          {primaryActions.length > 0 && (
            <div className="cdx-grid cdx-grid-cols-1 sm:cdx-grid-cols-2 cdx-gap-3">
              {primaryActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionClick(action)}
                  className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-2 cdx-px-4 cdx-py-3 cdx-rounded-xl cdx-bg-gradient-to-r cdx-from-purple-500 cdx-to-indigo-600 hover:cdx-from-purple-600 hover:cdx-to-indigo-700 cdx-text-white cdx-font-medium cdx-transition-all cdx-shadow-md hover:cdx-shadow-lg"
                >
                  <HiOutlineSparkles className="cdx-w-5 cdx-h-5" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* 次要操作 */}
          {secondaryActions.length > 0 && (
            <div className="cdx-flex cdx-flex-wrap cdx-gap-2">
              {secondaryActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionClick(action)}
                  className="cdx-px-4 cdx-py-2 cdx-rounded-lg cdx-bg-white dark:cdx-bg-neutral-800 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="cdx-flex cdx-flex-col cdx-h-full cdx-overflow-y-auto">
      {isAnalyzing && !result ? (
        renderLoading()
      ) : error && !result ? (
        renderError()
      ) : result ? (
        renderResult()
      ) : (
        renderEmpty()
      )}
    </div>
  )
}

export default PageVisionView
