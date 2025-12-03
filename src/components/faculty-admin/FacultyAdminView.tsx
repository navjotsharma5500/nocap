import { useState } from 'react';
import { Filter, CheckSquare, Users, Building, Calendar, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { permissionRequests } from '@/data/mockData';
import { PermissionRequest } from '@/types/campuspass';
import { toast } from '@/hooks/use-toast';

export function FacultyAdminView() {
  const [requests, setRequests] = useState<PermissionRequest[]>(
    permissionRequests.filter((r) => r.status === 'pending_dosa' || r.status === 'approved')
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [societyFilter, setSocietyFilter] = useState<string>('all');
  const [hostelFilter, setHostelFilter] = useState<string>('all');

  const societies = [...new Set(requests.map((r) => r.society))];
  const hostels = [...new Set(requests.flatMap((r) => r.students.map((s) => s.hostel)))];

  const filteredRequests = requests.filter((r) => {
    if (societyFilter !== 'all' && r.society !== societyFilter) return false;
    if (hostelFilter !== 'all' && !r.students.some((s) => s.hostel === hostelFilter)) return false;
    return true;
  });

  const pendingRequests = filteredRequests.filter((r) => r.status === 'pending_dosa');

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingIds = pendingRequests.map((r) => r.id);
    if (selected.length === pendingIds.length) {
      setSelected([]);
    } else {
      setSelected(pendingIds);
    }
  };

  const handleBulkApprove = () => {
    setRequests((prev) =>
      prev.map((r) =>
        selected.includes(r.id) ? { ...r, status: 'approved' as const } : r
      )
    );
    toast({
      title: 'Requests Approved',
      description: `${selected.length} requests have been approved successfully.`,
    });
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Faculty/DoSA Dashboard</h1>
            <p className="text-muted-foreground">Dean of Student Affairs • Night Permission Management</p>
          </div>
          
          {selected.length > 0 && (
            <Button onClick={handleBulkApprove} className="gap-2 gradient-primary animate-scale-in">
              <CheckSquare className="h-4 w-4" />
              Approve Selected ({selected.length})
            </Button>
          )}
        </div>

        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <Select value={societyFilter} onValueChange={setSocietyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Society" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Societies</SelectItem>
                {societies.map((society) => (
                  <SelectItem key={society} value={society}>{society}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hostelFilter} onValueChange={setHostelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hostel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hostels</SelectItem>
                {hostels.map((hostel) => (
                  <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="ml-auto">
              {filteredRequests.length} requests
            </Badge>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selected.length === pendingRequests.length && pendingRequests.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Society</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Students</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className="transition-colors hover:bg-muted/30 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-4">
                      {request.status === 'pending_dosa' && (
                        <Checkbox
                          checked={selected.includes(request.id)}
                          onCheckedChange={() => toggleSelect(request.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{request.society}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-foreground">{request.reason}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {request.students.slice(0, 3).map((student) => (
                            <img
                              key={student.id}
                              src={student.photo}
                              alt={student.name}
                              className="h-8 w-8 rounded-full border-2 border-card object-cover"
                            />
                          ))}
                        </div>
                        {request.students.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{request.students.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={request.status === 'approved' ? 'default' : 'secondary'}
                        className={request.status === 'approved' ? 'bg-success text-success-foreground' : ''}
                      >
                        {request.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {request.status === 'pending_dosa' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === request.id ? { ...r, status: 'approved' as const } : r
                              )
                            );
                            toast({ title: 'Request Approved' });
                          }}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
