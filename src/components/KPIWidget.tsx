
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, Percent } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  format?: 'currency' | 'percentage' | 'number';
  category?: string;
  subtitle?: string;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  change,
  changeType,
  format = 'number',
  category,
  subtitle
}) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getIconForCategory = (cat?: string) => {
    switch (cat) {
      case 'financial':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'percentage':
        return <Percent className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {getIconForCategory(category)}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold">
            {formatValue(value, format)}
          </div>
          
          {subtitle &&
          <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          }
          
          {change !== undefined &&
          <div className={`flex items-center text-xs ${getChangeColor(changeType)}`}>
              {getChangeIcon(changeType)}
              <span className="ml-1">
                {Math.abs(change)}% from last period
              </span>
            </div>
          }
          
          {category &&
          <Badge variant="secondary" className="w-fit text-xs">
              {category}
            </Badge>
          }
        </div>
      </CardContent>
    </Card>);

};

export default KPIWidget;