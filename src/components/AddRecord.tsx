import { useState, useRef } from 'react';
import { UserPlus, Loader2, CheckCircle, Download, Link2, Check, CloudOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../DataContext';
import { getInitials, getInitialsBg } from '../utils/initials';
import { Attendee } from '../types';
import { isGoogleSheetsConfigured } from '../googleSheets';

export default function AddRecord() {
  const { addAttendee, synced } = useData();
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    department: '',
    position: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdAttendee, setCreatedAttendee] = useState<Attendee | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const sheetConfigured = isGoogleSheetsConfigured();

  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
  const previewInitials = fullName ? getInitials(fullName) : '?';
  const previewBg = fullName ? getInitialsBg(fullName) : 'bg-gray-400';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.department.trim()) errs.department = 'Required';
    if (!form.position.trim()) errs.position = 'Required';
    if (!form.gender) errs.gender = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const attendee = await addAttendee({
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        department: form.department.trim(),
        position: form.position.trim(),
        address: form.address.trim(),
      });

      setCreatedAttendee(attendee);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    if (!createdAttendee || !qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
        const link = document.createElement('a');
        link.download = `QR-${createdAttendee.name.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getRegistrationLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#register`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getRegistrationLink());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRegisterAnother = () => {
    setForm({
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      department: '',
      position: '',
      gender: '',
      email: '',
      phone: '',
    });
    setErrors({});
    setSubmitted(false);
    setCreatedAttendee(null);
  };

  if (submitted && createdAttendee) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={28} />
            <h2 className="text-xl font-bold">Registration Successful!</h2>
          </div>
          <p className="text-green-100">
            {synced ? 'Data has been saved to the database.' : 'Data has been saved locally.'}
          </p>
        </div>

        {/* Attendee Card + QR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
          <div className={`w-16 h-16 rounded-full ${getInitialsBg(createdAttendee.name)} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
            {getInitials(createdAttendee.name)}
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{createdAttendee.name}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {createdAttendee.department} · {createdAttendee.position}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {createdAttendee.gender} · {createdAttendee.email || 'No email'} · {createdAttendee.phone || 'No phone'}
          </p>

          {/* QR Code */}
          <div ref={qrRef} className="inline-block bg-white p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 mt-5">
            <QRCodeSVG
              value={JSON.stringify({
                id: createdAttendee.id,
                name: createdAttendee.name,
                department: createdAttendee.department,
              })}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#1e40af"
              bgColor="#ffffff"
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
            Download or screenshot this QR code for attendance
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={handleDownloadQR}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Download size={18} />
              Download QR Code
            </button>
            <button
              onClick={handleRegisterAnother}
              className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 py-3 rounded-xl font-medium transition-all"
            >
              Register Another Person
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendee Registration</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Register a new attendee and generate QR code</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg"
        >
          {linkCopied ? <Check size={16} /> : <Link2 size={16} />}
          {linkCopied ? 'Link Copied!' : 'Copy Registration Link'}
        </button>
      </div>

      {/* Show shareable link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-3">
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Share this link for self-registration:</p>
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">{getRegistrationLink()}</p>
      </div>

      {!sheetConfigured && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex items-center gap-2.5">
          <CloudOff size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
          <p className="text-xs text-orange-700 dark:text-orange-400">
            Offline mode. Data saved locally only.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
        {/* Live Preview */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-800 rounded-xl mb-5">
          <div className={`w-14 h-14 rounded-full ${previewBg} flex items-center justify-center text-white text-xl font-bold transition-colors shadow-lg`}>
            {previewInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 dark:text-white truncate">
              {fullName || 'Full Name'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
              {form.department || 'Department'} · {form.position || 'Position'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
              {form.gender || 'Gender'} · {form.email || 'Email'} · {form.phone || 'Phone'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name Fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Juan"
                disabled={submitting}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  errors.firstName
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 bg-white dark:bg-slate-800'
                } dark:text-white dark:placeholder-slate-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={form.middleName}
                onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))}
                placeholder="Santos"
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Dela Cruz"
                disabled={submitting}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  errors.lastName
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 bg-white dark:bg-slate-800'
                } dark:text-white dark:placeholder-slate-500`}
              />
            </div>
          </div>

          {/* Row 2: Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Street, City, Province"
              disabled={submitting}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all disabled:opacity-60"
            />
          </div>

          {/* Row 3: Department & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Department/Office <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="IT Department"
                disabled={submitting}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  errors.department
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 bg-white dark:bg-slate-800'
                } dark:text-white dark:placeholder-slate-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                placeholder="Software Engineer"
                disabled={submitting}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  errors.position
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 bg-white dark:bg-slate-800'
                } dark:text-white dark:placeholder-slate-500`}
              />
            </div>
          </div>

          {/* Row 4: Gender, Email, Phone */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value as typeof form.gender }))}
                disabled={submitting}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  errors.gender
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 bg-white dark:bg-slate-800'
                } dark:text-white`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="09171234567"
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-950/50 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Register Attendee
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
