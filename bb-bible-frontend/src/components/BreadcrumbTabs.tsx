'use client';

interface BreadcrumbTabsProps {
  steps: Array<{
    id: string;
    label: string;
    active: boolean;
    clickable?: boolean;
    onClick?: () => void;
  }>;
}

export default function BreadcrumbTabs({ steps }: BreadcrumbTabsProps) {
  return (
    <div 
      className="border-b mb-6"
      style={{ borderColor: '#D2CFC8' }}
    >
      <div className="flex">
        {steps.map((step) => (
          <div key={step.id} className="flex-1">
            {step.clickable ? (
              <button
                onClick={step.onClick}
                className="w-full py-3 text-center font-semibold transition-all duration-150 border-b-2 -mb-px active:scale-[0.96] active:bg-[#E8E4DC]"
                style={{
                  fontSize: '18px',
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  color: step.active ? '#55524F' : '#D2CFC8',
                  borderColor: step.active ? '#8D8881' : 'transparent'
                }}
              >
                {step.label}
              </button>
            ) : (
              <div
                className="w-full py-3 text-center font-semibold border-b-2 -mb-px"
                style={{
                  fontSize: '18px',
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  color: step.active ? '#55524F' : '#D2CFC8',
                  borderColor: step.active ? '#8D8881' : 'transparent'
                }}
              >
                {step.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
