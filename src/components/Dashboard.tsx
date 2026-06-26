import React from 'react';
import { Users, UserCheck, UserX, Clock, QrCode, ArrowRight } from 'lucide-react';
import { getAttendees, getTodayRecords } from '../db';
import { Page } from '../types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const attendees = getAttendees();
  const todayRecords = getTodayRecords();

  const checkedInToday = new Set(
    todayRecords.filter(r => r.type === 'check-in').map(r => r.attendeeId)
  );

  // Currently present = last action is check-in
  const presentIds = new Set<string>();
  for (const id of checkedInToday) {
    const lastAction = todayRecords.find(r => r.attendeeId === id);
    if (lastAction && lastAction.type === 'check-in') {
      presentIds.add(id);
    }
  }

  const totalAttendees = attendees.length;
  const presentCount = presentIds.size;
  const absentCount = totalAttendees - checkedInToday.size;
  const totalScans = todayRecords.length;

  const recentRecords = todayRecords.slice(0, 5);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold">{greeting}! 👋</h1>
        <p className="text-indigo-100 mt-1">{dateStr}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onNavigate('scanner')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <QrCode size={18} />
            Open Scanner
          </button>
          <button
            onClick={() => onNavigate('attendees')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <Users size={18} />
            View All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={22} />}
          label="Total Attendees"
          value={totalAttendees}
          lightColor="bg-blue-50 text-blue-600"
          darkColor="dark:bg-blue-950 dark:text-blue-400"
          iconBgLight="bg-blue-100"
          iconBgDark="dark:bg-blue-900"
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Present Today"
          value={presentCount}
          lightColor="bg-green-50 text-green-600"
          darkColor="dark:bg-green-950 dark:text-green-400"
          iconBgLight="bg-green-100"
          iconBgDark="dark:bg-green-900"
        />
        <StatCard
          icon={<UserX size={22} />}
          label="Absent Today"
          value={absentCount}
          lightColor="bg-red-50 text-red-600"
          darkColor="dark:bg-red-950 dark:text-red-400"
          iconBgLight="bg-red-100"
          iconBgDark="dark:bg-red-900"
        />
        <StatCard
          icon={<QrCode size={22} />}
          label="Total Scans"
          value={totalScans}
          lightColor="bg-purple-50 text-purple-600"
          darkColor="dark:bg-purple-950 dark:text-purple-400"
          iconBgLight="bg-purple-100"
          iconBgDark="dark:bg-purple-900"
        />
      </div>

      {/* Attendance Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today's Attendance Rate</h3>
        <div className="relative w-full h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${totalAttendees > 0 ? (checkedInToday.size / totalAttendees) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-slate-400">
          <span>{checkedInToday.size} checked in</span>
          <span>{totalAttendees > 0 ? Math.round((checkedInToday.size / totalAttendees) * 100) : 0}%</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
          <button
            onClick={() => onNavigate('log')}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-slate-500">
            <Clock size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No activity yet today</p>
            <p className="text-sm mt-1">Start scanning QR codes to record attendance</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map(record => (
              <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  record.type === 'check-in'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                    : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                }`}>
                  {record.type === 'check-in' ? '↓' : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white truncate">{record.attendeeName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{record.attendeeDepartment}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    record.type === 'check-in'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
                  }`}>
                    {record.type === 'check-in' ? 'Check In' : 'Check Out'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
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

function StatCard({ icon, label, value, lightColor, darkColor, iconBgLight, iconBgDark }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  lightColor: string;
  darkColor: string;
  iconBgLight: string;
  iconBgDark: string;
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm transition-colors ${lightColor} ${darkColor}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBgLight} ${iconBgDark}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-75 mt-1">{label}</p>
    </div>
  );
}
