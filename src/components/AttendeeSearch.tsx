import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Attendee } from '../types';
import { getInitials, getInitialsBg } from '../utils/initials';
import { useData } from '../DataContext';

interface Props {
  onSelect: (attendee: Attendee) => void;
}

export default function AttendeeSearch({ onSelect }: Props) {
  const { attendees } = useData();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query.trim()
    ? attendees.filter(
        a =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.department.toLowerCase().includes(query.toLowerCase()) ||
          a.position.toLowerCase().includes(query.toLowerCase()) ||
          a.email.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleSelect = (attendee: Attendee) => {
    onSelect(attendee);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Manual Lookup</h3>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
        Search by name, department, or position to record attendance without QR
      </p>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
        />
        <input
          type="text"
          placeholder="Search attendees..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 text-sm transition-colors"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="mt-3 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl divide-y divide-gray-50 dark:divide-slate-700 shadow-lg">
          {filtered.map(attendee => (
            <button
              key={attendee.id}
              onClick={() => handleSelect(attendee)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <div
                className={`w-9 h-9 rounded-full ${getInitialsBg(attendee.name)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
              >
                {getInitials(attendee.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {attendee.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                  {attendee.department} · {attendee.position}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && filtered.length === 0 && (
        <div className="mt-3 px-4 py-6 text-center bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-gray-400 dark:text-slate-500">No attendees found</p>
        </div>
      )}
    </div>
  );
}
