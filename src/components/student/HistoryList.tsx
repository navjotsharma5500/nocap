import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { permissionHistory } from '@/data/mockData';

const statusConfig = {
  completed: { icon: CheckCircle, label: 'Completed', variant: 'secondary' as const },
  active: { icon: Clock, label: 'Active', variant: 'default' as const },
  expired: { icon: AlertCircle, label: 'Expired', variant: 'destructive' as const },
};

export function HistoryList() {
  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Permission History</h3>
      
      {permissionHistory.map((item, index) => {
        const config = statusConfig[item.status];
        const Icon = config.icon;
        
        return (
          <Card
            key={item.id}
            className="p-4 transition-all hover:shadow-elevated"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.reason}</span>
                  <Badge variant={config.variant} className="text-xs">
                    {config.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {item.exitTime} - {item.returnTime || 'Ongoing'}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
