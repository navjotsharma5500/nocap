import { useState } from 'react';
import { Users, Plus, Send, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { societyMembers } from '@/data/mockData';
import { Student } from '@/types/campuspass';
import { toast } from '@/hooks/use-toast';

export function SocietyEBView() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedMembers.length === 0 || !date || !reason) {
      toast({
        title: 'Missing Information',
        description: 'Please select members, date, and provide a reason.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Request Submitted',
      description: 'Your request has been sent to the Society President.',
    });
    setSelectedMembers([]);
    setDate('');
    setReason('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Society EB Dashboard</h1>
            <p className="text-muted-foreground">Tech Club • General Secretary</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 gradient-primary">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 p-6 animate-slide-up">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Create Permission Request</h3>
            
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Selected: {selectedMembers.length} members
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedMembers.map((id) => {
                    const member = societyMembers.find((m) => m.id === id);
                    return member ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {member.name.split(' ')[0]}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Reason</label>
              <Textarea
                placeholder="e.g., Hackathon Prep - Code Sprint Night"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="gap-2 gradient-primary">
              <Send className="h-4 w-4" />
              Submit to President
            </Button>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Society Members</h2>
              <Badge variant="secondary">{societyMembers.length}</Badge>
            </div>
          </div>

          <div className="divide-y divide-border">
            {societyMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                />
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.rollNo}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-foreground">{member.hostel}</p>
                  <p className="text-muted-foreground">{member.room}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
