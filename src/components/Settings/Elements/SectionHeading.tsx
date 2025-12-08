import React from 'react';

interface SectionHeadingProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
}

const SectionHeading = ({ title, icon, description }: SectionHeadingProps) => {
  return (
    <div className="cdx-flex cdx-items-start cdx-gap-3 cdx-mb-6">
      {icon && (
        <div className="settings-section-icon cdx-bg-blue-100 dark:cdx-bg-blue-900/30">
          <div className="cdx-text-blue-500">{icon}</div>
        </div>
      )}
      <div>
        <h2 className="cdx-text-xl cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-neutral-100">
          {title}
        </h2>
        {description && (
          <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SectionHeading;
