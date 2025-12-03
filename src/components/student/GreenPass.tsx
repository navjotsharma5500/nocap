import { useState, useEffect } from 'react';
import { Shield, X, Clock } from 'lucide-react';
import { currentStudent } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface GreenPassProps {
  onClose: () => void;
}

export function GreenPass({ onClose }: GreenPassProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col gradient-success animate-scale-in">
      <div className="flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-success-foreground hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-white/20 p-6 animate-pulse-slow">
          <Shield className="h-16 w-16 text-success-foreground" />
        </div>

        <img
          src={currentStudent.photo}
          alt={currentStudent.name}
          className="mb-6 h-32 w-32 rounded-full object-cover ring-4 ring-white/50 shadow-elevated"
        />

        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-success-foreground">
          AUTHORIZED
        </h1>
        <h2 className="mb-4 text-2xl font-bold text-success-foreground/90">
          TO LEAVE
        </h2>

        <p className="mb-2 text-xl font-semibold text-success-foreground">
          {currentStudent.name}
        </p>
        <p className="mb-8 text-lg text-success-foreground/80">
          {currentStudent.rollNo}
        </p>

        <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-4">
          <Clock className="h-6 w-6 text-success-foreground animate-tick" />
          <span className="font-mono text-3xl font-bold text-success-foreground">
            {formatTime(seconds)}
          </span>
        </div>

        <p className="mt-4 text-sm text-success-foreground/70">
          Live verification • Not a screenshot
        </p>
      </div>

      <div className="p-6 text-center">
        <p className="text-sm text-success-foreground/80">
          Show this screen to the security guard
        </p>
      </div>
    </div>
  );
}
