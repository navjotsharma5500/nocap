import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusCard } from './StatusCard';
import { GreenPass } from './GreenPass';
import { HistoryList } from './HistoryList';

export function StudentView() {
  const [showGreenPass, setShowGreenPass] = useState(false);
  const [hasActivePermission, setHasActivePermission] = useState(false);

  const handleScan = () => {
    setHasActivePermission(true);
    setShowGreenPass(true);
  };

  if (showGreenPass) {
    return <GreenPass onClose={() => setShowGreenPass(false)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-md px-4 py-6">
        <StatusCard isActive={hasActivePermission} />

        <div className="mt-6">
          <HistoryList />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur p-4">
        <div className="container max-w-md">
          <Button
            onClick={handleScan}
            className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
          >
            <QrCode className="mr-3 h-6 w-6" />
            Scan Desk QR
          </Button>
        </div>
      </div>
    </div>
  );
}
