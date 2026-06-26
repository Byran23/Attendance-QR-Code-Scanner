import { Attendee, AttendanceRecord } from './types';

const ATTENDEES_KEY = 'attendease_attendees';
const RECORDS_KEY = 'attendease_records';

export function getAttendees(): Attendee[] {
  const data = localStorage.getItem(ATTENDEES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttendees(attendees: Attendee[]): void {
  localStorage.setItem(ATTENDEES_KEY, JSON.stringify(attendees));
}

export function addAttendee(attendee: Attendee): void {
  const attendees = getAttendees();
  attendees.push(attendee);
  saveAttendees(attendees);
}

export function updateAttendee(updated: Attendee): void {
  const attendees = getAttendees();
  const index = attendees.findIndex(a => a.id === updated.id);
  if (index !== -1) {
    attendees[index] = updated;
    saveAttendees(attendees);
  }
}

export function deleteAttendee(id: string): void {
  const attendees = getAttendees().filter(a => a.id !== id);
  saveAttendees(attendees);
}

export function getAttendeeById(id: string): Attendee | undefined {
  return getAttendees().find(a => a.id === id);
}

export function getRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(record: AttendanceRecord): void {
  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
}

export function clearRecords(): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify([]));
}

export function getTodayRecords(): AttendanceRecord[] {
  const today = new Date().toDateString();
  return getRecords().filter(r => new Date(r.timestamp).toDateString() === today);
}

export function getAttendeeLastAction(attendeeId: string): AttendanceRecord | undefined {
  const todayRecords = getTodayRecords().filter(r => r.attendeeId === attendeeId);
  return todayRecords.length > 0 ? todayRecords[0] : undefined;
}

export function seedDemoData(): void {
  if (getAttendees().length > 0) return;
  
  const demoAttendees: Attendee[] = [
    {
      id: 'demo-001',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      department: 'Engineering',
      role: 'Software Engineer',
      phone: '+1 (555) 123-4567',
      avatar: '👩‍💻',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-002',
      name: 'Bob Smith',
      email: 'bob@company.com',
      department: 'Design',
      role: 'UI/UX Designer',
      phone: '+1 (555) 234-5678',
      avatar: '👨‍🎨',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-003',
      name: 'Carol Davis',
      email: 'carol@company.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      phone: '+1 (555) 345-6789',
      avatar: '👩‍💼',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-004',
      name: 'David Lee',
      email: 'david@company.com',
      department: 'Engineering',
      role: 'DevOps Engineer',
      phone: '+1 (555) 456-7890',
      avatar: '👨‍🔧',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-005',
      name: 'Eva Martinez',
      email: 'eva@company.com',
      department: 'HR',
      role: 'HR Specialist',
      phone: '+1 (555) 567-8901',
      avatar: '👩‍💼',
      createdAt: new Date().toISOString(),
    },
  ];

  saveAttendees(demoAttendees);
}
