import { useState } from 'react';
import { Inbox, Check, X, Send, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { permissionRequests } from '@/data/mockData';
import { PermissionRequest } from '@/types/campuspass';
import { toast } from '@/hooks/use-toast';

const statusVariants = {
  pending_president: 'default',
  pending_dosa: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const;

const statusLabels = {
  pending_president: 'Pending Review',
  pending_dosa: 'Sent to DoSA',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function PresidentView() {
  const [requests, setRequests] = useState<PermissionRequest[]>(
    permissionRequests.filter((r) => r.status === 'pending_president')
  );

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({
      title: action === 'approve' ? 'Forwarded to DoSA' : 'Request Rejected',
      description: action === 'approve' 
        ? 'The request has been sent to the Dean of Student Affairs.'
        : 'The request has been rejected and the EB has been notified.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Society President Dashboard</h1>
          <p className="text-muted-foreground">Tech Club • Review and forward requests</p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Pending Requests</h2>
          <Badge variant="default">{requests.length}</Badge>
        </div>

        {requests.length === 0 ? (
          <Card className="p-12 text-center animate-fade-in">
            <Inbox className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
            <p className="text-muted-foreground">No pending requests to review.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <Card
                key={request.id}
                className="overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{request.reason}</h3>
                      <p className="text-sm text-muted-foreground">Submitted by {request.createdBy}</p>
                    </div>
                    <Badge variant={statusVariants[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(request.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{request.students.length} students</span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {request.students.map((student) => (
                      <div key={student.id} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-foreground">{student.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAction(request.id, 'approve')}
                      className="flex-1 gap-2 gradient-primary"
                    >
                      <Send className="h-4 w-4" />
                      Approve & Forward to DoSA
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(request.id, 'reject')}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
