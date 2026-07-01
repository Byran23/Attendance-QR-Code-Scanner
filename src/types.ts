export interface Attendee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string; // computed full name
  email: string;
  department: string;
  position: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  address: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  attendeeId: string;
  attendeeName: string;
  attendeePosition: string;
  attendeeDepartment: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}
