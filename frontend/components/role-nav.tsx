"use client"
import { ChevronDown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserRole =
  | "Student"
  | "Society_EB"
  | "Society_President"
  | "Faculty_Admin"
  | "Guard"
  | "Room_Booking"
  | "Venue_Booking"

interface RoleNavProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function RoleNav({ currentRole, onRoleChange }: RoleNavProps) {
  const workflowRoles: { value: UserRole; label: string }[] = [
    { value: "Student", label: "Student" },
    { value: "Society_EB", label: "Society EB (Level 1)" },
    { value: "Society_President", label: "President (Level 2)" },
    { value: "Faculty_Admin", label: "Faculty Admin (Final)" },
    { value: "Guard", label: "Guard (Checkpoint)" },
  ]

  const bookingRoles: { value: UserRole; label: string }[] = [
    { value: "Room_Booking", label: "Room Booking" },
    { value: "Venue_Booking", label: "Venue Booking" },
  ]

  const getCurrentLabel = () => {
    const all = [...workflowRoles, ...bookingRoles]
    return all.find((r) => r.value === currentRole)?.label || "Student"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CampusPass</h1>
              <p className="text-xs text-muted-foreground">Multi-Actor Permission System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent min-w-[180px] justify-between">
                  {getCurrentLabel()}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Workflow Roles</p>
                {workflowRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.value}
                    onClick={() => onRoleChange(role.value)}
                    className={currentRole === role.value ? "bg-primary/10" : ""}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Booking Modules</p>
                {bookingRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.value}
                    onClick={() => onRoleChange(role.value)}
                    className={currentRole === role.value ? "bg-primary/10" : ""}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
