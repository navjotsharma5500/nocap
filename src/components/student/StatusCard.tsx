import { Home, Shield, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { currentStudent } from '@/data/mockData';

interface StatusCardProps {
  isActive: boolean;
}

export function StatusCard({ isActive }: StatusCardProps) {
  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className={`p-6 ${isActive ? 'gradient-success' : 'gradient-primary'}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">Current Status</p>
            <h2 className="mt-1 text-2xl font-bold text-primary-foreground">
              {isActive ? 'Permission Active' : 'In Hostel'}
            </h2>
          </div>
          <div className={`rounded-full p-3 ${isActive ? 'bg-white/20' : 'bg-white/20'}`}>
            {isActive ? (
              <Shield className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Home className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-card">
        <div className="flex items-center gap-4">
          <img
            src={currentStudent.photo}
            alt={currentStudent.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{currentStudent.name}</h3>
            <p className="text-sm text-muted-foreground">{currentStudent.rollNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{currentStudent.hostel}</p>
            <p className="text-sm text-muted-foreground">Room {currentStudent.room}</p>
          </div>
        </div>
        
        {isActive && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-success">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Valid until 06:00 AM</span>
          </div>
        )}
      </div>
    </Card>
  );
}
