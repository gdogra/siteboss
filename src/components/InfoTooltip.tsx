import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Info, HelpCircle, AlertCircle, TrendingUp, Calculator } from 'lucide-react';

interface InfoTooltipProps {
  title?: string;
  content: string;
  impact?: string;
  calculation?: string;
  type?: 'info' | 'help' | 'warning' | 'metric' | 'calculation';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children?: React.ReactNode;
  maxWidth?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  content,
  impact,
  calculation,
  type = 'info',
  side = 'top',
  className = '',
  children,
  maxWidth = 'max-w-xs'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'help':
        return <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600 hover:text-yellow-700 transition-colors" />;
      case 'metric':
        return <TrendingUp className="w-4 h-4 text-blue-600 hover:text-blue-700 transition-colors" />;
      case 'calculation':
        return <Calculator className="w-4 h-4 text-green-600 hover:text-green-700 transition-colors" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />;
    }
  };

  const formatTooltipContent = () => (
    <div className={`${maxWidth} space-y-2`}>
      {title && (
        <div className="font-semibold text-sm border-b border-white/20 pb-1">
          {title}
        </div>
      )}
      
      <div className="text-xs leading-relaxed">
        {content}
      </div>
      
      {impact && (
        <div className="space-y-1">
          <div className="font-medium text-xs text-yellow-200">
            💡 Impact:
          </div>
          <div className="text-xs leading-relaxed text-gray-100">
            {impact}
          </div>
        </div>
      )}
      
      {calculation && (
        <div className="space-y-1">
          <div className="font-medium text-xs text-blue-200">
            🧮 Calculation:
          </div>
          <div className="text-xs font-mono bg-black/20 rounded px-2 py-1 text-gray-100">
            {calculation}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children || (
            <button type="button" className="inline-flex items-center">
              {getIcon()}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="bg-gray-900 text-white border-gray-700 shadow-lg p-3"
          sideOffset={8}
        >
          {formatTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Specialized tooltip components for common use cases
export const MetricTooltip: React.FC<Omit<InfoTooltipProps, 'type'>> = (props) => (
  <InfoTooltip {...props} type="metric" />
);

export const CalculationTooltip: React.FC<Omit<InfoTooltipProps, 'type'>> = (props) => (
  <InfoTooltip {...props} type="calculation" />
);

export const HelpTooltip: React.FC<Omit<InfoTooltipProps, 'type'>> = (props) => (
  <InfoTooltip {...props} type="help" />
);

export const WarningTooltip: React.FC<Omit<InfoTooltipProps, 'type'>> = (props) => (
  <InfoTooltip {...props} type="warning" />
);

export default InfoTooltip;