import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Attendee, AttendanceRecord, User } from './types';
import { isGoogleSheetsConfigured, addAttendeeToSheet, addRecordToSheet, deleteRecordFromSheet, clearRecordsFromSheet } from './googleSheets';

interface DataContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  attendees: Attendee[];
  records: AttendanceRecord[];
  synced: boolean;
  addAttendee: (attendee: Omit<Attendee, 'id' | 'createdAt' | 'name'>) => Promise<Attendee>;
  updateAttendee: (attendee: Attendee) => void;
  deleteAttendee: (id: string) => void;
  getAttendeeById: (id: string) => Attendee | undefined;
  addRecord: (attendee: Attendee, type: 'check-in' | 'check-out') => AttendanceRecord;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  getAttendeeLastAction: (attendeeId: string) => AttendanceRecord | undefined;
  getTodayCheckIns: () => AttendanceRecord[];
}

const DataContext = createContext<DataContextType | null>(null);

const ATTENDEES_KEY = 'attendance-attendees';
const RECORDS_KEY = 'attendance-records';
const USER_KEY = 'attendance-user';

// Default credentials (in production, use proper authentication)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

function loadFromStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Sample attendees for demo purposes
function getSampleAttendees(): Attendee[] {
  return [
    { id: 'att-001', firstName: 'Juan', middleName: 'Santos', lastName: 'Dela Cruz', name: 'Juan Santos Dela Cruz', email: 'juan@example.com', department: 'IT Department', position: 'Software Engineer', phone: '09171234567', gender: 'Male', address: 'Manila, Philippines', createdAt: new Date().toISOString() },
    { id: 'att-002', firstName: 'Maria', middleName: 'Garcia', lastName: 'Santos', name: 'Maria Garcia Santos', email: 'maria@example.com', department: 'HR Department', position: 'HR Manager', phone: '09179876543', gender: 'Female', address: 'Quezon City, Philippines', createdAt: new Date().toISOString() },
    { id: 'att-003', firstName: 'Pedro', middleName: 'Lopez', lastName: 'Reyes', name: 'Pedro Lopez Reyes', email: 'pedro@example.com', department: 'Finance', position: 'Accountant', phone: '09181112233', gender: 'Male', address: 'Makati, Philippines', createdAt: new Date().toISOString() },
    { id: 'att-004', firstName: 'Ana', middleName: 'Marie', lastName: 'Garcia', name: 'Ana Marie Garcia', email: 'ana@example.com', department: 'Marketing', position: 'Marketing Lead', phone: '09194455667', gender: 'Female', address: 'Pasig, Philippines', createdAt: new Date().toISOString() },
    { id: 'att-005', firstName: 'Carlos', middleName: 'Jose', lastName: 'Mendoza', name: 'Carlos Jose Mendoza', email: 'carlos@example.com', department: 'IT Department', position: 'DevOps Engineer', phone: '09207788990', gender: 'Male', address: 'Taguig, Philippines', createdAt: new Date().toISOString() },
  ];
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const stored = loadFromStorage<Attendee>(ATTENDEES_KEY);
    return stored.length > 0 ? stored : getSampleAttendees();
  });
  const [records, setRecords] = useState<AttendanceRecord[]>(() => loadFromStorage(RECORDS_KEY));
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem(ATTENDEES_KEY, JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setUser({ username, isLoggedIn: true });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addAttendee = useCallback(async (data: Omit<Attendee, 'id' | 'createdAt' | 'name'>): Promise<Attendee> => {
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    const attendee: Attendee = {
      ...data,
      name: fullName,
      id: `att-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };

    // Save locally first
    setAttendees(prev => [attendee, ...prev]);

    // Try to sync to Google Sheets
    if (isGoogleSheetsConfigured()) {
      try {
        const result = await addAttendeeToSheet(attendee);
        if (result.success) {
          setSynced(true);
        }
      } catch (err) {
        console.error('Failed to sync attendee to Google Sheets:', err);
      }
    }

    return attendee;
  }, []);

  const updateAttendee = useCallback((attendee: Attendee) => {
    setAttendees(prev => prev.map(a => (a.id === attendee.id ? attendee : a)));
  }, []);

  const deleteAttendee = useCallback((id: string) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAttendeeById = useCallback(
    (id: string) => attendees.find(a => a.id === id),
    [attendees],
  );

  const addRecord = useCallback((attendee: Attendee, type: 'check-in' | 'check-out') => {
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      attendeeId: attendee.id,
      attendeeName: attendee.name,
      attendeePosition: attendee.position,
      attendeeDepartment: attendee.department,
      type,
      timestamp: new Date().toISOString(),
    };

    // Save locally
    setRecords(prev => [record, ...prev]);

    // Try to sync to Google Sheets (fire and forget)
    if (isGoogleSheetsConfigured()) {
      addRecordToSheet(record).catch(err => {
        console.error('Failed to sync record to Google Sheets:', err);
      });
    }

    return record;
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));

    // Try to sync deletion to Google Sheets
    if (isGoogleSheetsConfigured()) {
      deleteRecordFromSheet(id).catch(err => {
        console.error('Failed to sync record deletion to Google Sheets:', err);
      });
    }
  }, []);

  const clearRecords = useCallback(() => {
    setRecords([]);

    // Try to sync to Google Sheets
    if (isGoogleSheetsConfigured()) {
      clearRecordsFromSheet().catch(err => {
        console.error('Failed to sync clear records to Google Sheets:', err);
      });
    }
  }, []);

  const getAttendeeLastAction = useCallback(
    (attendeeId: string) => {
      return records.find(r => r.attendeeId === attendeeId);
    },
    [records],
  );

  const getTodayCheckIns = useCallback(() => {
    const today = new Date().toDateString();
    return records.filter(r => 
      r.type === 'check-in' && 
      new Date(r.timestamp).toDateString() === today
    );
  }, [records]);

  return (
    <DataContext.Provider
      value={{
        user,
        login,
        logout,
        attendees,
        records,
        synced,
        addAttendee,
        updateAttendee,
        deleteAttendee,
        getAttendeeById,
        addRecord,
        deleteRecord,
        clearRecords,
        getAttendeeLastAction,
        getTodayCheckIns,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
