"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, QrCode, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PassPage({ params }: { params: { id: string } }) {
  const [isVerified, setIsVerified] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = () => {
    setIsVerified(true);
  };

  if (isVerified) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white green-screen-active overflow-hidden">
        {/* Watermark */}
        <div className="watermark text-white font-bold">
          OFFICIAL CAMPUS PASS • DO NOT SCREENSHOT
        </div>
        
        <div className="z-10 flex flex-col items-center space-y-6 p-8 text-center">
          <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm animate-bounce">
            <CheckCircle2 className="w-24 h-24 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-wider uppercase">Access Granted</h1>
          
          <div className="space-y-2">
            <p className="text-2xl font-semibold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-lg opacity-90">{currentTime.toLocaleDateString()}</p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md w-full max-w-sm border border-white/20">
            <h2 className="text-xl font-bold mb-2">Arjun Kumar</h2>
            <p className="text-sm opacity-80">2021CS1234 • CSE</p>
            <p className="text-sm opacity-80 mt-1">Tech Club • Night Permission</p>
          </div>

          <p className="text-xs opacity-60 max-w-xs">
            This screen is dynamically generated. Static screenshots are invalid.
            <br />
            Session ID: {params.id}-{Math.floor(Math.random() * 10000)}
          </p>

          <Button 
            variant="secondary" 
            className="mt-8 bg-white text-green-700 hover:bg-white/90"
            onClick={() => setIsVerified(false)}
          >
            Close Pass
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary overflow-hidden">
        <div className="bg-primary p-6 text-center text-primary-foreground">
          <div className="mx-auto w-24 h-24 bg-white rounded-full p-1 mb-4 shadow-lg">
            <Avatar className="w-full h-full">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl font-bold">Arjun Kumar</h2>
          <p className="opacity-90">Computer Science • 2021CS1234</p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full inline-flex items-center text-sm font-medium border border-green-200">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approved: Night Exit
            </div>
            <p className="text-sm text-muted-foreground">
              Valid until: Dec 9, 2025, 02:00 AM
            </p>
          </div>

          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-dashed border-slate-300">
              <QrCode className="w-48 h-48 text-slate-800" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium">Hackathon Prep</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">Tech Club Room</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approver</span>
                <span className="font-medium">Dr. Smith (DoSA)</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]" 
              onClick={handleVerify}
            >
              <ShieldAlert className="w-5 h-5 mr-2" />
              Tap to Verify at Gate
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Show this screen to the security guard. Do not share screenshots.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
