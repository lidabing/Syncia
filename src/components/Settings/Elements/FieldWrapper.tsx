import type React from 'react'

interface FieldWrapperProps {
  title: string
  children: React.ReactNode
  row?: boolean
  description?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}

const FieldWrapper = ({
  title,
  description,
  children,
  row,
  onSubmit,
}: FieldWrapperProps) => {
  return (
    <form
      data-row={row || undefined}
      className="cdx-group cdx-flex cdx-flex-col cdx-gap-2 data-[row]:cdx-items-center cdx-py-4 cdx-border-b cdx-border-neutral-100 dark:cdx-border-neutral-800 last:cdx-border-b-0 data-[row]:cdx-flex-row data-[row]:cdx-justify-between data-[row]:cdx-gap-4"
      onSubmit={onSubmit}
    >
      <div className="cdx-flex-1">
        <div className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-200">
          {title}
        </div>
        {description && (
          <p className="cdx-text-xs cdx-mt-1 cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="cdx-mt-2 data-[row]:cdx-mt-0 cdx-shrink-0">{children}</div>
    </form>
  )
}

export default FieldWrapper
