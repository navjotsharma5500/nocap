import { useState } from 'react';
import { Users, Plus, Send, DoorOpen, MapPin, Calendar, Clock, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { societyMembers, availableRooms, availableVenues } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export function SocietyEBView() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('night-permission');

  // Room booking state
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomDate, setRoomDate] = useState('');
  const [roomTimeSlot, setRoomTimeSlot] = useState('');
  const [roomPurpose, setRoomPurpose] = useState('');

  // Venue request state
  const [selectedVenue, setSelectedVenue] = useState('');
  const [eventName, setEventName] = useState('');
  const [venueDate, setVenueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleNightPermissionSubmit = () => {
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
      description: 'Your night permission request has been sent to the Society President.',
    });
    setSelectedMembers([]);
    setDate('');
    setReason('');
    setShowForm(false);
  };

  const handleRoomBookingSubmit = () => {
    if (!selectedRoom || !roomDate || !roomTimeSlot || !roomPurpose) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all room booking details.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Room Booking Submitted',
      description: 'Your room booking request has been sent to the Society President.',
    });
    setSelectedRoom('');
    setRoomDate('');
    setRoomTimeSlot('');
    setRoomPurpose('');
    setShowForm(false);
  };

  const handleVenueRequestSubmit = () => {
    if (!selectedVenue || !eventName || !venueDate || !startTime || !endTime || !expectedAttendees) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all venue request details.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Venue Request Submitted',
      description: 'Your venue request has been sent to the Society President.',
    });
    setSelectedVenue('');
    setEventName('');
    setVenueDate('');
    setStartTime('');
    setEndTime('');
    setExpectedAttendees('');
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="night-permission" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Night Permission</span>
                  <span className="sm:hidden">Night</span>
                </TabsTrigger>
                <TabsTrigger value="room-booking" className="gap-2">
                  <DoorOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Room Booking</span>
                  <span className="sm:hidden">Room</span>
                </TabsTrigger>
                <TabsTrigger value="venue-request" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Venue Request</span>
                  <span className="sm:hidden">Venue</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="night-permission" className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Night Permission Request</h3>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="flex flex-wrap gap-1 min-h-[38px] items-center">
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Reason</label>
                  <Textarea
                    placeholder="e.g., Hackathon Prep - Code Sprint Night"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleNightPermissionSubmit} className="gap-2 gradient-primary">
                  <Send className="h-4 w-4" />
                  Submit to President
                </Button>
              </TabsContent>

              <TabsContent value="room-booking" className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Room Booking Request</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Select Room</label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} - {room.building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
                    <Input
                      type="date"
                      value={roomDate}
                      onChange={(e) => setRoomDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Time Slot</label>
                  <Select value={roomTimeSlot} onValueChange={setRoomTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="21:00-00:00">21:00 - 00:00 (3 hours)</SelectItem>
                      <SelectItem value="21:00-02:00">21:00 - 02:00 (5 hours)</SelectItem>
                      <SelectItem value="22:00-01:00">22:00 - 01:00 (3 hours)</SelectItem>
                      <SelectItem value="22:00-04:00">22:00 - 04:00 (6 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Purpose</label>
                  <Textarea
                    placeholder="e.g., Overnight coding session for upcoming hackathon"
                    value={roomPurpose}
                    onChange={(e) => setRoomPurpose(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleRoomBookingSubmit} className="gap-2 gradient-primary">
                  <Send className="h-4 w-4" />
                  Submit Room Booking
                </Button>
              </TabsContent>

              <TabsContent value="venue-request" className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Event Venue Request</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Select Venue</label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVenues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name} (Capacity: {venue.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Event Name</label>
                    <Input
                      placeholder="e.g., TechFest 2024 Opening"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
                    <Input
                      type="date"
                      value={venueDate}
                      onChange={(e) => setVenueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">End Time</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Expected Attendees</label>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(e.target.value)}
                  />
                </div>
                <Button onClick={handleVenueRequestSubmit} className="gap-2 gradient-primary">
                  <Send className="h-4 w-4" />
                  Submit Venue Request
                </Button>
              </TabsContent>
            </Tabs>
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
