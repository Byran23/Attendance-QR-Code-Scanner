import { useState } from 'react';
import { LogIn, LogOut, Users, TrendingUp, Search, CheckCircle, UserCheck } from 'lucide-react';
import { useData } from '../DataContext';
import { getInitials, getInitialsBg } from '../utils/initials';
import { Attendee } from '../types';

export default function Dashboard() {
  const { records, attendees, addRecord, getAttendeeLastAction, getTodayCheckIns } = useData();
  const [search, setSearch] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  const today = new Date().toDateString();
  const todayRecords = records.filter(r => new Date(r.timestamp).toDateString() === today);
  const todayCheckIns = todayRecords.filter(r => r.type === 'check-in').length;
  const todayCheckOuts = todayRecords.filter(r => r.type === 'check-out').length;
  const todayCheckInRecords = getTodayCheckIns();
  const checkedInAttendeeIds = new Set(todayCheckInRecords.map(r => r.attendeeId));
  const uniqueToday = checkedInAttendeeIds.size;

  const stats = [
    {
      label: "Today's Check-ins",
      value: todayCheckIns,
      icon: LogIn,
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-200 dark:shadow-green-950/30',
    },
    {
      label: "Today's Check-outs",
      value: todayCheckOuts,
      icon: LogOut,
      gradient: 'from-orange-500 to-red-500',
      shadow: 'shadow-orange-200 dark:shadow-orange-950/30',
    },
    {
      label: 'Unique Attendees',
      value: uniqueToday,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-200 dark:shadow-blue-950/30',
    },
    {
      label: 'Total Records',
      value: records.length,
      icon: TrendingUp,
      gradient: 'from-rose-800 to-red-900',
      shadow: 'shadow-rose-300 dark:shadow-rose-950/30',
    },
  ];

  // Search attendees for manual check-in
  const filteredAttendees = search.trim()
    ? attendees.filter(
        a =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.department.toLowerCase().includes(search.toLowerCase()) ||
          a.position.toLowerCase().includes(search.toLowerCase()),
      ).slice(0, 5)
    : [];

  const handleManualCheckIn = (attendee: Attendee) => {
    const lastAction = getAttendeeLastAction(attendee.id);
    const actionType = lastAction?.type === 'check-in' ? 'check-out' : 'check-in';
    addRecord(attendee, actionType);
    setCheckInSuccess(`${attendee.name} - ${actionType === 'check-in' ? 'Checked In' : 'Checked Out'}`);
    setSearch('');
    setTimeout(() => setCheckInSuccess(null), 3000);
  };

  // Progress bar calculation
  const totalAttendees = attendees.length;
  const progressPercent = totalAttendees > 0 ? Math.round((uniqueToday / totalAttendees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          Overview of today's attendance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-lg ${stat.shadow} transition-transform hover:scale-[1.02]`}
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
              <stat.icon size={20} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-white/80 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <UserCheck size={18} className="text-blue-500" />
            Today's Attendance Progress
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            {uniqueToday} / {totalAttendees} attendees
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-right">
          {progressPercent}% checked in today
        </p>
      </div>

      {/* Manual Check-in */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-5 border border-blue-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <LogIn size={18} className="text-blue-500" />
          Manual Check-in
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
          Search and check-in an attendee without scanning QR code
        </p>

        {checkInSuccess && (
          <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 animate-pulse">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400 text-sm font-medium">{checkInSuccess}</span>
          </div>
        )}

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search attendee by name, department..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
          />
        </div>

        {filteredAttendees.length > 0 && (
          <div className="mt-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden shadow-lg">
            {filteredAttendees.map(attendee => {
              const lastAction = getAttendeeLastAction(attendee.id);
              const nextAction = lastAction?.type === 'check-in' ? 'Check Out' : 'Check In';
              const isCheckedIn = checkedInAttendeeIds.has(attendee.id);

              return (
                <button
                  key={attendee.id}
                  onClick={() => handleManualCheckIn(attendee)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full ${getInitialsBg(attendee.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {getInitials(attendee.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{attendee.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                      {attendee.department} · {attendee.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCheckedIn && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Present
                      </span>
                    )}
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                      nextAction === 'Check In'
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-500 text-white'
                    }`}>
                      {nextAction}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Check-ins List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Today's Checked-in Attendees</h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
            {uniqueToday} present
          </span>
        </div>
        {todayCheckInRecords.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">No check-ins yet today</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {todayCheckInRecords.map(record => (
              <div key={record.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${getInitialsBg(record.attendeeName)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {getInitials(record.attendeeName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {record.attendeeName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                    {record.attendeeDepartment} · {record.attendeePosition}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                    Present
                  </span>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
