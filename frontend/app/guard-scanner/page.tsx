"use client"

import { useState, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle, XCircle, Scan, ArrowLeft, Camera, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function GuardScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (scanning && !scanner) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      }

      const html5QrScanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      )

      html5QrScanner.render(
        async (decodedText) => {
          console.log('QR Code scanned:', decodedText)

          // Send to backend for verification
          try {
            const response = await fetch(`${API_URL}/api/guard/verify-qr`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                qrToken: decodedText,
                guardId: 'guard-001', // Replace with actual logged-in guard ID
              }),
            })

            const data = await response.json()
            console.log('Verification result:', data)
            setResult(data)
            html5QrScanner.clear()
            setScanning(false)
            setScanner(null)
          } catch (error) {
            console.error('Verification error:', error)
            setResult({
              success: false,
              message: 'Failed to verify. Check backend connection at ' + API_URL,
            })
            html5QrScanner.clear()
            setScanning(false)
            setScanner(null)
          }
        },
        (errorMessage) => {
          // Silent error handling - scanning errors are normal
          console.log('Scan error:', errorMessage)
        }
      )

      setScanner(html5QrScanner)
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanning])

  const startScanning = () => {
    setResult(null)
    setError('')
    setScanning(true)
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().catch(console.error)
      setScanner(null)
    }
    setScanning(false)
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Verification Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            {result.success ? (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-green-600">✓ APPROVED</h2>
                  <p className="text-gray-600 font-medium">{result.message}</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Name</p>
                      <p className="font-bold text-green-900">{result.student?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Roll No</p>
                      <p className="font-bold text-green-900">{result.student?.rollNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Hostel</p>
                      <p className="font-bold text-green-900">{result.student?.hostel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Exit Time</p>
                      <p className="font-bold text-green-900">{result.student?.exitTime}</p>
                    </div>
                  </div>

                  {result.student?.returnTime && (
                    <div className="border-t border-green-300 pt-2">
                      <p className="text-xs text-green-700 font-semibold">Expected Return</p>
                      <p className="text-sm text-green-900 font-bold">{result.student.returnTime}</p>
                    </div>
                  )}

                  <div className="border-t border-green-300 pt-2">
                    <p className="text-xs text-green-700 font-semibold">Reason</p>
                    <p className="text-sm text-green-900 font-medium">{result.student?.reason}</p>
                  </div>

                  <div className="border-t border-green-300 pt-2">
                    <p className="text-xs text-green-700 font-semibold">Society</p>
                    <p className="text-sm text-green-900 font-medium">{result.student?.society}</p>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-lg p-2">
                    <p className="text-xs text-green-700 font-semibold">Valid Until</p>
                    <p className="text-sm text-green-900 font-bold">{result.student?.validUntil}</p>
                  </div>

                  {result.student?.verifiedAt && (
                    <div className="text-xs text-green-600 text-center">
                      First verified: {result.student.verifiedAt}
                    </div>
                  )}
                </div>
                <div className="bg-green-500 text-white rounded-lg p-4 text-center">
                  <p className="font-black text-lg">✓ STUDENT APPROVED</p>
                  <p className="text-sm mt-1 opacity-90">
                    Allow student to leave campus
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-red-600">ACCESS DENIED</h2>
                  <p className="text-gray-700 font-medium">{result.message}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <p className="text-red-800 font-bold">DO NOT ALLOW EXIT</p>
                  <p className="text-sm text-red-700 mt-2">
                    {result.verifiedAt && `Previously verified at: ${result.verifiedAt}`}
                  </p>
                </div>
              </>
            )}
            <Button onClick={startScanning} className="w-full h-12 text-lg font-bold">
              <Camera className="w-5 h-5 mr-2" />
              Scan Another Pass
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">Guard Scanner</h1>
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        {!scanning ? (
          <Card className="shadow-2xl">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Scan className="w-14 h-14 text-white" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black text-gray-800">Ready to Scan</h2>
                <p className="text-gray-600 leading-relaxed">
                  Position the student's QR code within the camera frame to verify their exit pass
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-800">📱 Instructions:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Allow camera access when prompted</li>
                  <li>Hold student's phone steady in frame</li>
                  <li>Ensure good lighting conditions</li>
                  <li>Wait for automatic scan</li>
                </ul>
              </div>
              <Button
                onClick={startScanning}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Start Camera
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 animate-pulse" />
                  Scanning for QR Code...
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div id="qr-reader" className="w-full"></div>
              </CardContent>
            </Card>
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-yellow-200 text-sm text-center">
              📷 Point camera at QR code to scan
            </div>
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="w-full h-12 text-lg font-bold shadow-lg"
            >
              Stop Scanning
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
