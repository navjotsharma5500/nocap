"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"

const DISMISS_KEY = "campuspass_install_dismissed"
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export default function InstallPrompt() {
    const { canInstall, isInstalled, triggerInstall } = useInstallPrompt()
    const [showPrompt, setShowPrompt] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isInstalled || !canInstall) {
            setShowPrompt(false)
            return
        }

        // Check if dismissed recently
        const dismissedAt = localStorage.getItem(DISMISS_KEY)
        if (dismissedAt) {
            const dismissTime = parseInt(dismissedAt, 10)
            if (Date.now() - dismissTime < DISMISS_DURATION) {
                return
            }
        }

        // Show after 30 seconds or user interaction
        const showTimer = setTimeout(() => {
            setShowPrompt(true)
            setTimeout(() => setIsVisible(true), 50)
        }, 30000)

        const handleInteraction = () => {
            clearTimeout(showTimer)
            setTimeout(() => {
                setShowPrompt(true)
                setTimeout(() => setIsVisible(true), 50)
            }, 2000)
        }

        window.addEventListener("click", handleInteraction, { once: true })
        window.addEventListener("scroll", handleInteraction, { once: true })

        return () => {
            clearTimeout(showTimer)
            window.removeEventListener("click", handleInteraction)
            window.removeEventListener("scroll", handleInteraction)
        }
    }, [canInstall, isInstalled])

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(() => setShowPrompt(false), 300)
        localStorage.setItem(DISMISS_KEY, Date.now().toString())
    }

    const handleInstall = async () => {
        const success = await triggerInstall()
        if (success) {
            setIsVisible(false)
            setTimeout(() => setShowPrompt(false), 300)
        }
    }

    if (!showPrompt || isInstalled) return null

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                }`}
        >
            <div className="mx-auto max-w-lg p-4">
                <div className="rounded-2xl border bg-background/95 backdrop-blur-lg shadow-2xl p-4">
                    <div className="flex items-start gap-4">
                        {/* App Icon */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <Smartphone className="w-7 h-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">Install CampusPass</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Quick access to your campus pass anytime
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleDismiss}
                        >
                            Not now
                        </Button>
                        <Button
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={handleInstall}
                        >
                            <Download className="w-4 h-4" />
                            Install
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
