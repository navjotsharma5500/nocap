"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GuardScanPage() {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [studentData, setStudentData] = useState<any>(null);

  const handleScan = (text: string) => {
    if (text && verificationStatus === 'idle') {
      setScannedResult(text);
      verifyPass(text);
    }
  };

  const verifyPass = async (qrData: string) => {
    setVerificationStatus('loading');
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock verification logic
      // In a real app, we would parse the QR data (e.g., a JWT or ID) and call the backend
      const isValid = Math.random() > 0.2; // 80% chance of success for demo
      
      if (isValid) {
        setVerificationStatus('valid');
        setStudentData({
          name: "Arjun Kumar",
          rollNo: "2021CS1234",
          photo: "https://github.com/shadcn.png",
          reason: "Hackathon Prep",
          exitTime: "21:00",
          returnTime: "02:00"
        });
      } else {
        setVerificationStatus('invalid');
      }
    }, 1500);
  };

  const resetScanner = () => {
    setScannedResult(null);
    setVerificationStatus('idle');
    setStudentData(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-2">Guard Terminal</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6">
        
        {verificationStatus === 'idle' && (
          <Card className="w-full bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader>
              <CardTitle>Scan Student Pass</CardTitle>
              <CardDescription className="text-slate-400">Point camera at the student's QR code</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 relative bg-black">
                <Scanner 
                  onScan={(result) => result[0] && handleScan(result[0].rawValue)}
                  components={{ audio: false, onOff: false, torch: true, zoom: true, finder: true }}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
                <div className="absolute inset-0 border-2 border-primary/50 animate-pulse pointer-events-none"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'loading' && (
          <Card className="w-full bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Verifying Pass...</p>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'valid' && studentData && (
          <Card className="w-full bg-green-900/20 border-green-500 text-slate-100 border-2">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-500/20 p-3 rounded-full w-fit mb-2">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-400">Access Granted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 bg-slate-800/50 p-3 rounded-lg">
                <img src={studentData.photo} alt="Student" className="w-16 h-16 rounded-full border-2 border-green-500" />
                <div>
                  <h3 className="font-bold text-lg">{studentData.name}</h3>
                  <p className="text-slate-400">{studentData.rollNo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400">Reason</p>
                  <p className="font-medium">{studentData.reason}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-slate-400">Time Slot</p>
                  <p className="font-medium">{studentData.exitTime} - {studentData.returnTime}</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" onClick={resetScanner}>
                Scan Next Student
              </Button>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'invalid' && (
          <Card className="w-full bg-red-900/20 border-red-500 text-slate-100 border-2">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-500/20 p-3 rounded-full w-fit mb-2">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-400">Access Denied</CardTitle>
              <CardDescription className="text-red-200">Invalid or Expired Pass</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" onClick={resetScanner}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
