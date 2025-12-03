import { Shield, ChevronDown } from 'lucide-react';
import { UserRole } from '@/types/campuspass';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, string> = {
  Student: 'Student',
  Society_EB: 'Society EB',
  Society_President: 'Society President',
  Faculty_Admin: 'Faculty/DoSA',
  Guard: 'Security Guard',
};

const roles: UserRole[] = ['Student', 'Society_EB', 'Society_President', 'Faculty_Admin', 'Guard'];

export function Navbar({ currentRole, onRoleChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-elevated">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">CampusPass</h1>
            <p className="text-xs text-muted-foreground">Night Permission System</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 font-medium">
              <span className="hidden sm:inline">View as:</span>
              <span className="text-primary">{roleLabels[currentRole]}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {roles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => onRoleChange(role)}
                className={currentRole === role ? 'bg-primary/10 text-primary' : ''}
              >
                {roleLabels[role]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
