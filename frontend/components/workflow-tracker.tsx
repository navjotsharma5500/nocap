"use client"

import type React from "react"

import { Check, Clock, X, User, Users, Briefcase, Building2, Shield } from "lucide-react"
import type { ApprovalLevel } from "@/lib/workflow-data"

interface WorkflowStep {
  level: ApprovalLevel
  action: "approved" | "rejected" | "pending"
  timestamp?: string
  remarks?: string
}

interface WorkflowTrackerProps {
  steps: WorkflowStep[]
  compact?: boolean
}

const levelConfig: Record<ApprovalLevel, { label: string; icon: React.ReactNode }> = {
  student: { label: "Student", icon: <User className="w-4 h-4" /> },
  society_eb: { label: "Society EB", icon: <Users className="w-4 h-4" /> },
  society_president: { label: "President", icon: <Briefcase className="w-4 h-4" /> },
  faculty_admin: { label: "Faculty Admin", icon: <Building2 className="w-4 h-4" /> },
}

export default function WorkflowTracker({ steps, compact = false }: WorkflowTrackerProps) {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <div className={`flex ${compact ? "gap-1" : "gap-2"} items-center flex-wrap`}>
      {steps.map((step, index) => {
        const config = levelConfig[step.level]
        const isLast = index === steps.length - 1

        return (
          <div key={step.level} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${step.action === "approved"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : step.action === "rejected"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
            >
              {step.action === "approved" ? (
                <Check className="w-3 h-3" />
              ) : step.action === "rejected" ? (
                <X className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {!compact && config.label}
            </div>
            {!isLast && <span className="text-slate-300">→</span>}
          </div>
        )
      })}
    </div>
  )
}
