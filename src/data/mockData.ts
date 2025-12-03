import { Student, PermissionRequest, PermissionHistory, RoomBookingRequest, VenueRequest } from '@/types/campuspass';

export const currentStudent: Student = {
  id: '1',
  rollNo: '2021CS1234',
  name: 'Arjun Kumar',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  hostel: 'Hostel A',
  room: 'A-204',
};

export const societyMembers: Student[] = [
  currentStudent,
  { id: '2', rollNo: '2021CS1235', name: 'Priya Sharma', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', hostel: 'Hostel B', room: 'B-105' },
  { id: '3', rollNo: '2021CS1236', name: 'Rahul Verma', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', hostel: 'Hostel A', room: 'A-312' },
  { id: '4', rollNo: '2021CS1237', name: 'Sneha Patel', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', hostel: 'Hostel C', room: 'C-201' },
  { id: '5', rollNo: '2021CS1238', name: 'Vikram Singh', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', hostel: 'Hostel A', room: 'A-118' },
];

export const permissionRequests: PermissionRequest[] = [
  {
    id: '1',
    students: [societyMembers[0], societyMembers[1], societyMembers[2]],
    society: 'Tech Club',
    reason: 'Hackathon Prep - Code Sprint Night',
    date: '2024-12-05',
    status: 'pending_president',
    createdBy: 'Amit Gupta (Gen Sec)',
    createdAt: '2024-12-03T10:30:00',
  },
  {
    id: '2',
    students: [societyMembers[3], societyMembers[4]],
    society: 'Drama Club',
    reason: 'Annual Play Rehearsal',
    date: '2024-12-06',
    status: 'pending_dosa',
    createdBy: 'Neha Reddy (Gen Sec)',
    createdAt: '2024-12-02T14:15:00',
  },
  {
    id: '3',
    students: societyMembers,
    society: 'Photography Club',
    reason: 'Night Sky Photography Session',
    date: '2024-12-07',
    status: 'approved',
    createdBy: 'Ravi Kumar (Gen Sec)',
    createdAt: '2024-12-01T09:00:00',
  },
];

export const roomBookingRequests: RoomBookingRequest[] = [
  {
    id: '1',
    roomName: 'Meeting Room 101',
    building: 'Student Activity Center',
    date: '2024-12-05',
    timeSlot: '21:00 - 02:00',
    purpose: 'Hackathon overnight coding session',
    society: 'Tech Club',
    status: 'pending_president',
    createdBy: 'Amit Gupta (Gen Sec)',
    createdAt: '2024-12-03T11:00:00',
  },
  {
    id: '2',
    roomName: 'Rehearsal Hall B',
    building: 'Cultural Block',
    date: '2024-12-06',
    timeSlot: '22:00 - 01:00',
    purpose: 'Late night play rehearsal',
    society: 'Drama Club',
    status: 'approved',
    createdBy: 'Neha Reddy (Gen Sec)',
    createdAt: '2024-12-02T15:00:00',
  },
];

export const venueRequests: VenueRequest[] = [
  {
    id: '1',
    venueName: 'Main Auditorium',
    eventName: 'TechFest 2024 - Opening Ceremony',
    date: '2024-12-10',
    startTime: '18:00',
    endTime: '22:00',
    expectedAttendees: 500,
    society: 'Tech Club',
    status: 'pending_dosa',
    createdBy: 'Amit Gupta (Gen Sec)',
    createdAt: '2024-12-01T09:00:00',
  },
  {
    id: '2',
    venueName: 'Open Air Theatre',
    eventName: 'Annual Drama Night',
    date: '2024-12-15',
    startTime: '19:00',
    endTime: '23:00',
    expectedAttendees: 300,
    society: 'Drama Club',
    status: 'pending_president',
    createdBy: 'Neha Reddy (Gen Sec)',
    createdAt: '2024-12-02T10:00:00',
  },
];

export const availableRooms = [
  { id: '1', name: 'Meeting Room 101', building: 'Student Activity Center' },
  { id: '2', name: 'Meeting Room 102', building: 'Student Activity Center' },
  { id: '3', name: 'Rehearsal Hall A', building: 'Cultural Block' },
  { id: '4', name: 'Rehearsal Hall B', building: 'Cultural Block' },
  { id: '5', name: 'Computer Lab 3', building: 'Tech Block' },
];

export const availableVenues = [
  { id: '1', name: 'Main Auditorium', capacity: 800 },
  { id: '2', name: 'Open Air Theatre', capacity: 500 },
  { id: '3', name: 'Seminar Hall 1', capacity: 150 },
  { id: '4', name: 'Central Lawn', capacity: 1000 },
  { id: '5', name: 'Mini Auditorium', capacity: 200 },
];

export const permissionHistory: PermissionHistory[] = [
  { id: '1', date: '2024-12-01', exitTime: '21:30', returnTime: '23:45', reason: 'Tech Club Meeting', status: 'completed' },
  { id: '2', date: '2024-11-28', exitTime: '20:00', returnTime: '22:30', reason: 'Library Night Study', status: 'completed' },
  { id: '3', date: '2024-11-25', exitTime: '21:00', returnTime: '00:15', reason: 'Hackathon', status: 'completed' },
];
