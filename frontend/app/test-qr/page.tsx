"use client"
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function TestQRPage() {
    const [qrSrc, setQrSrc] = useState('')

    useEffect(() => {
        // Generate the exact string required by the student view scanner
        QRCode.toDataURL('HOSTEL_DESK_ACTIVATE_V1')
            .then(url => setQrSrc(url))
            .catch(err => console.error(err))
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-black">
            <div className="max-w-md w-full text-center space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Hostel Desk QR</h1>
                    <p className="text-gray-500">For Testing Purposes</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border inline-block">
                    {qrSrc ? (
                        <img src={qrSrc} alt="Hostel Desk QR" className="w-64 h-64" />
                    ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                            Loading...
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 p-4 rounded-lg text-left">
                    <h3 className="font-semibold text-sm mb-2 text-gray-700">How to test:</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        <li>Open the app on your phone</li>
                        <li>Go to the Student Dashboard</li>
                        <li>Tap <b>"Scan Hostel QR"</b></li>
                        <li>Scan the code above</li>
                    </ol>
                </div>

                <p className="font-mono text-xs text-gray-400">Content: HOSTEL_DESK_ACTIVATE_V1</p>
            </div>
        </div>
    )
}
