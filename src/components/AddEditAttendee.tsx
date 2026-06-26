import { useState } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addAttendee, updateAttendee } from '../db';
import { Attendee, Page } from '../types';

interface AddEditAttendeeProps {
  onNavigate: (page: Page) => void;
  editData?: Attendee | null;
}

const AVATARS = ['👤', '👩‍💻', '👨‍💻', '👩‍🎨', '👨‍🎨', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬', '👩‍🏫', '👨‍🏫', '👩‍🔧', '👨‍🔧', '🧑‍💻', '🧑‍🎨', '🧑‍💼'];

export default function AddEditAttendee({ onNavigate, editData }: AddEditAttendeeProps) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: editData?.name || '',
    email: editData?.email || '',
    department: editData?.department || '',
    role: editData?.role || '',
    phone: editData?.phone || '',
    avatar: editData?.avatar || '👤',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && editData) {
      updateAttendee({
        ...editData,
        ...form,
      });
    } else {
      addAttendee({
        id: uuidv4(),
        ...form,
        createdAt: new Date().toISOString(),
      });
    }

    setSaved(true);
    setTimeout(() => onNavigate('attendees'), 800);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => onNavigate('attendees')}
        className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Attendees
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {isEdit ? 'Edit Attendee' : 'Add New Attendee'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isEdit ? 'Update attendee information' : 'Register a new attendee in the system'}
            </p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
            ✅ Attendee {isEdit ? 'updated' : 'added'} successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    form.avatar === avatar
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 scale-110'
                      : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))}
              error={errors.name}
              placeholder="John Doe"
            />
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))}
              error={errors.email}
              placeholder="john@company.com"
            />
            <InputField
              label="Department"
              value={form.department}
              onChange={v => setForm(f => ({ ...f, department: v }))}
              error={errors.department}
              placeholder="Engineering"
            />
            <InputField
              label="Role"
              value={form.role}
              onChange={v => setForm(f => ({ ...f, role: v }))}
              error={errors.role}
              placeholder="Software Engineer"
            />
            <InputField
              label="Phone (optional)"
              value={form.phone}
              onChange={v => setForm(f => ({ ...f, phone: v }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saved}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
            >
              <Save size={18} />
              {isEdit ? 'Update' : 'Add'} Attendee
            </button>
            <button
              type="button"
              onClick={() => onNavigate('attendees')}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, error, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
            : 'border-gray-200 dark:border-slate-700 focus:ring-indigo-500 bg-white dark:bg-slate-800'
        } dark:text-white dark:placeholder-slate-500`}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
