// Google Sheets API configuration
// Set your deployed Google Apps Script web app URL here
const GOOGLE_SHEETS_URL: string = 'https://script.google.com/macros/s/AKfycbwgSUxc4VkP4fyl8jj454rOF6AfPxhdPXHC0mXxPZlntlAcqCMKquaS07e8B60Mkovwkg/exec';

export function isGoogleSheetsConfigured(): boolean {
  return GOOGLE_SHEETS_URL.trim().length > 0;
}

export async function fetchAllData(): Promise<{
  success: boolean;
  attendees?: Array<Record<string, unknown>>;
  records?: Array<Record<string, unknown>>;
  error?: string;
}> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getAll`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function postToSheet(action: string, payload: Record<string, unknown>): Promise<{
  success: boolean;
  error?: string;
  [key: string]: unknown;
}> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function addAttendeeToSheet(attendee: {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  address: string;
  department: string;
  position: string;
  gender: string;
  email: string;
  phone?: string;
  createdAt: string;
}): Promise<{ success: boolean; error?: string }> {
  return postToSheet('addAttendee', { attendee });
}

export async function updateAttendeeInSheet(attendee: {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  address: string;
  department: string;
  position: string;
  gender: string;
  email: string;
  phone?: string;
  createdAt: string;
}): Promise<{ success: boolean; error?: string }> {
  return postToSheet('updateAttendee', { attendee });
}

export async function deleteAttendeeFromSheet(id: string): Promise<{ success: boolean; error?: string }> {
  return postToSheet('deleteAttendee', { id });
}

export async function addRecordToSheet(record: {
  id: string;
  attendeeId: string;
  attendeeName: string;
  attendeePosition: string;
  attendeeDepartment: string;
  timestamp: string;
  type: 'check-in' | 'check-out';
}): Promise<{ success: boolean; error?: string }> {
  return postToSheet('addRecord', { record });
}

export async function deleteRecordFromSheet(id: string): Promise<{ success: boolean; error?: string }> {
  return postToSheet('deleteRecord', { id });
}

export async function clearRecordsFromSheet(): Promise<{ success: boolean; error?: string }> {
  return postToSheet('clearRecords', {});
}

export async function getActivePins(): Promise<{ success: boolean; pins?: string[]; error?: string }> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getPins`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
