import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HandHeart, Calendar,
  Settings, LogOut, Search, Menu, X,
  UserCheck, UserX, MessageSquare,
  CheckCircle, XCircle, Loader2, BookOpen,
  Moon, Sun, Trash2, Edit, Save
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
}

function toArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// যেকোনো time format কে "HH:MM" (24-hour) এ convert করে
function toInputTime(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const parts    = timeStr.trim().split(' ');
    const meridiem = parts[1];
    const timeParts = parts[0].split(':');
    let h = parseInt(timeParts[0], 10);
    const m = parseInt(timeParts[1] || '0', 10);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  if (timeStr.includes(':')) return timeStr.slice(0, 5);
  return timeStr;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [darkMode, setDarkMode]           = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(false);

  // ── User delete confirm ──────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Prayer edit modal ────────────────────────────────────────────────────
  const [editingPrayer, setEditingPrayer]   = useState<any | null>(null);
  const [editPrayerTime, setEditPrayerTime] = useState('');
  const [editSaving, setEditSaving]         = useState(false);
  const [editError, setEditError]           = useState('');

  // ── Event CRUD state ─────────────────────────────────────────────────────
  const [eventModal, setEventModal]             = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent]         = useState<any | null>(null);
  const [eventForm, setEventForm]               = useState({
    event_name: '', event_date: '', hijri_date: '', hijri_month: '',
    hijri_day: '', event_type: 'religious', description: '', is_active: true, display_order: ''
  });
  const [eventSaving, setEventSaving]           = useState(false);
  const [eventError, setEventError]             = useState('');
  const [deleteEventConfirm, setDeleteEventConfirm] = useState<string | null>(null);

  // ── Data state ───────────────────────────────────────────────────────────
  const [users, setUsers]                 = useState<any[]>([]);
  const [donations, setDonations]         = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes]     = useState<any[]>([]);
  const [events, setEvents]               = useState<any[]>([]);
  const [miladRequests, setMiladRequests] = useState<any[]>([]);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || adminUser.role !== 'admin') navigate('/user-login');
  }, []);

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const [u, m, e, d] = await Promise.all([
          fetch(`${API_URL}/api/v1/admin/users`,            { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/admin/milads`,           { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/events/all`,             { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API_URL}/api/v1/payment/user/donations`, { headers: authHeaders() }).then(r => r.json()),
        ]);
        setUsers(toArray(u.data));
        setMiladRequests(toArray(m.data));
        setEvents(toArray(e.data));
        setDonations(toArray(d.data));
      } else if (tab === 'users') {
        const r = await fetch(`${API_URL}/api/v1/admin/users`, { headers: authHeaders() });
        const d = await r.json();
        setUsers(toArray(d.data));
      } else if (tab === 'prayer-times') {
        const r = await fetch(`${API_URL}/api/v1/prayer-times`, { headers: authHeaders() });
        const d = await r.json();
        if (d.success && d.data) {
          const flat: any[] = [];
          if (d.data.fard?.azan)   flat.push(...d.data.fard.azan);
          if (d.data.fard?.jamaat) flat.push(...d.data.fard.jamaat);
          if (d.data.nafl)         flat.push(...d.data.nafl);
          setPrayerTimes(flat.sort((a, b) => a.display_order - b.display_order));
        }
      } else if (tab === 'events') {
        // Admin এ সব event দেখানো হয় (active/inactive উভয়)
        // তাই /events/all ব্যবহার করছি — প্রয়োজনে admin-only endpoint বানাতে পারেন
        const r = await fetch(`${API_URL}/api/v1/events/all`, { headers: authHeaders() });
        const d = await r.json();
        setEvents(toArray(d.data));
      } else if (tab === 'milad-requests') {
        const r = await fetch(`${API_URL}/api/v1/admin/milads`, { headers: authHeaders() });
        const d = await r.json();
        setMiladRequests(toArray(d.data));
      } else if (tab === 'donations') {
        const r = await fetch(`${API_URL}/api/v1/payment/user/donations`, { headers: authHeaders() });
        const d = await r.json();
        setDonations(toArray(d.data));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', headers: authHeaders() });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/user-login');
    }
  };

  // ── User actions ─────────────────────────────────────────────────────────
  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ is_active: isActive ? 0 : 1 })
      });
      const d = await r.json();
      if (d.success) setUsers(prev => prev.map(u => u.id == userId ? { ...u, is_active: isActive ? 0 : 1 } : u));
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setUsers(prev => prev.filter(u => u.id != userId)); setDeleteConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  // ── Milad actions ────────────────────────────────────────────────────────
  const handleMiladStatus = async (id: string, status: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/milads/${id}/status`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (d.success) setMiladRequests(prev => prev.map(m => m.id == id ? { ...m, status } : m));
    } catch (err) { console.error(err); }
  };

  // ── Prayer actions ───────────────────────────────────────────────────────
  const handleOpenEditPrayer = (prayer: any) => {
    setEditingPrayer(prayer);
    const rawTime = prayer.prayer_time || prayer.time || '';
    setEditPrayerTime(toInputTime(rawTime));
    setEditError('');
  };

  const handleSavePrayer = async () => {
    if (!editingPrayer) return;
    if (!editPrayerTime) { setEditError('সময় দিন'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      const timeToSend = editPrayerTime + ':00';
      const r = await fetch(`${API_URL}/api/v1/admin/prayer-times/${editingPrayer.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ prayer_time: timeToSend })
      });
      const d = await r.json();
      if (d.success) {
        setPrayerTimes(prev => prev.map(p =>
          p.id === editingPrayer.id
            ? { ...p, prayer_time: timeToSend, time: d.data?.time || timeToSend }
            : p
        ));
        setEditingPrayer(null);
      } else {
        setEditError(d.errors?.prayer_time?.[0] || d.message || 'Update failed');
      }
    } catch { setEditError('Network error'); }
    finally { setEditSaving(false); }
  };

  // ── Event actions ────────────────────────────────────────────────────────
  const openCreateEvent = () => {
    setEventForm({
      event_name: '', event_date: '', hijri_date: '', hijri_month: '',
      hijri_day: '', event_type: 'religious', description: '', is_active: true, display_order: ''
    });
    setEventError('');
    setEventModal('create');
  };

  const openEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      event_name:    event.event_name    || '',
      event_date:    event.event_date    ? String(event.event_date).slice(0, 10) : '',
      hijri_date:    event.hijri_date    || '',
      hijri_month:   event.hijri_month   || '',
      hijri_day:     event.hijri_day     ? String(event.hijri_day) : '',
      event_type:    event.event_type    || 'religious',
      description:   event.description  || '',
      is_active:     !!event.is_active,
      display_order: event.display_order ? String(event.display_order) : '',
    });
    setEventError('');
    setEventModal('edit');
  };

  const handleSaveEvent = async () => {
    if (!eventForm.event_name || !eventForm.event_date || !eventForm.event_type) {
      setEventError('ইভেন্টের নাম, তারিখ ও ধরন আবশ্যক');
      return;
    }
    setEventSaving(true);
    setEventError('');
    try {
      const isEdit = eventModal === 'edit';
      // ✅ Routes অনুযায়ী: POST /api/v1/admin/events, PUT /api/v1/admin/events/{id}
      const url = isEdit
        ? `${API_URL}/api/v1/admin/events/${editingEvent.id}`
        : `${API_URL}/api/v1/admin/events`;

      const payload = {
        ...eventForm,
        hijri_day:     eventForm.hijri_day     ? parseInt(eventForm.hijri_day)     : null,
        display_order: eventForm.display_order ? parseInt(eventForm.display_order) : null,
      };

      const r = await fetch(url, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body:    JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.success) {
        if (isEdit) {
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...d.data } : e));
        } else {
          setEvents(prev => [...prev, d.data]);
        }
        setEventModal(null);
      } else {
        if (d.errors) {
          const firstError = Object.values(d.errors)[0];
          setEventError(Array.isArray(firstError) ? firstError[0] as string : String(firstError));
        } else {
          setEventError(d.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
        }
      }
    } catch { setEventError('Network error'); }
    finally { setEventSaving(false); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // ✅ Routes অনুযায়ী: DELETE /api/v1/admin/events/{id}
      const r = await fetch(`${API_URL}/api/v1/admin/events/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (d.success) { setEvents(prev => prev.filter(e => e.id != id)); setDeleteEventConfirm(null); }
      else alert(d.message || 'Delete failed');
    } catch { alert('Network error'); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'active': case 'approved': return 'bg-green-100 text-green-800';
      case 'processing': case 'read':  return 'bg-blue-100 text-blue-800';
      case 'pending':   case 'unread': return 'bg-yellow-100 text-yellow-800';
      case 'failed':    case 'rejected': return 'bg-red-100 text-red-800';
      case 'inactive':  return 'bg-gray-100 text-gray-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const categoryNames: Record<string, string> = {
    zakat: 'যাকাত', iftar: 'ইফতার', durjog: 'দুর্গত',
    sitarto: 'শীতার্ত', gachropon: 'গাছরোপণ',
    kurbani: 'কুরবানি', orphan: 'এতিম', general: 'সাধারণ'
  };

  const bg   = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-white'  : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bdr  = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputCls = `w-full border ${bdr} rounded-lg px-3 py-2 text-sm ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`;

  const pendingMilad = miladRequests.filter(m => m.status === 'pending').length;

  const sidebarItems = [
    { id: 'dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'users',          label: 'Users',           icon: Users           },
    { id: 'prayer-times',   label: 'Prayer Time',     icon: BookOpen        },
    { id: 'events',         label: 'Events',          icon: Calendar        },
    { id: 'milad-requests', label: 'Milad Requests',  icon: MessageSquare   },
    { id: 'donations',      label: 'Donations',       icon: HandHeart       },
    { id: 'settings',       label: 'Settings',        icon: Settings        },
  ];

  return (
    <div className={`min-h-screen ${bg} flex`}>

      {/* ── User Delete Confirm Modal ──────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ব্যবহারকারী মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteEventConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ইভেন্ট মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteEventConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm`}>বাতিল</button>
              <button onClick={() => handleDeleteEvent(deleteEventConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Create / Edit Modal ──────────────────────────────────────── */}
      {eventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${card} rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${text}`}>
                {eventModal === 'create' ? 'নতুন ইভেন্ট যোগ করুন' : 'ইভেন্ট সম্পাদনা করুন'}
              </h3>
              <button onClick={() => setEventModal(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* event_name */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>ইভেন্টের নাম *</label>
                <input type="text" value={eventForm.event_name}
                  onChange={e => setEventForm(f => ({ ...f, event_name: e.target.value }))}
                  placeholder="যেমন: ঈদুল ফিতর" className={inputCls} />
              </div>

              {/* event_date + event_type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>তারিখ (ইংরেজি) *</label>
                  <input type="date" value={eventForm.event_date}
                    onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ধরন *</label>
                  <select value={eventForm.event_type}
                    onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}
                    className={inputCls}>
                    <option value="religious">Religious (ধর্মীয়)</option>
                    <option value="festival">Festival (উৎসব)</option>
                    <option value="special">Special (বিশেষ)</option>
                    <option value="historical">Historical (ঐতিহাসিক)</option>
                  </select>
                </div>
              </div>

              {/* hijri_date + hijri_month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি তারিখ</label>
                  <input type="text" value={eventForm.hijri_date}
                    onChange={e => setEventForm(f => ({ ...f, hijri_date: e.target.value }))}
                    placeholder="যেমন: ১ শাওয়াল ১৪৪৬" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি মাস</label>
                  <input type="text" value={eventForm.hijri_month}
                    onChange={e => setEventForm(f => ({ ...f, hijri_month: e.target.value }))}
                    placeholder="যেমন: শাওয়াল" className={inputCls} />
                </div>
              </div>

              {/* hijri_day + display_order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>হিজরি দিন</label>
                  <input type="number" value={eventForm.hijri_day} min="1" max="30"
                    onChange={e => setEventForm(f => ({ ...f, hijri_day: e.target.value }))}
                    placeholder="যেমন: ১" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${sub}`}>ক্রম (Display Order)</label>
                  <input type="number" value={eventForm.display_order} min="1"
                    onChange={e => setEventForm(f => ({ ...f, display_order: e.target.value }))}
                    placeholder="যেমন: 1" className={inputCls} />
                </div>
              </div>

              {/* description */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${sub}`}>বিবরণ</label>
                <textarea value={eventForm.description} rows={3}
                  onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="ইভেন্টের বিবরণ লিখুন..."
                  className={`${inputCls} resize-none`} />
              </div>

              {/* is_active */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="event-active" checked={eventForm.is_active}
                  onChange={e => setEventForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="event-active" className={`text-sm ${text}`}>সক্রিয় রাখুন</label>
              </div>
            </div>

            {eventError && <p className="text-red-500 text-sm mt-3">{eventError}</p>}

            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setEventModal(null)}
                className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSaveEvent} disabled={eventSaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {eventSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {eventModal === 'create' ? 'যোগ করুন' : 'আপডেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prayer Edit Modal ──────────────────────────────────────────────── */}
      {editingPrayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${text}`}>সময় পরিবর্তন করুন</h3>
              <button onClick={() => setEditingPrayer(null)} className={sub}><X className="w-5 h-5" /></button>
            </div>
            <p className={`text-sm mb-4 ${sub}`}>
              {editingPrayer.display_name_bn} ({editingPrayer.display_name_en})
            </p>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${sub}`}>নতুন সময়</label>
              <input
                type="time"
                value={editPrayerTime}
                onChange={(e) => setEditPrayerTime(e.target.value)}
                className={`w-full border ${bdr} rounded-lg px-3 py-2 text-lg ${text} ${darkMode ? 'bg-gray-700' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              <p className={`text-xs mt-1 ${sub}`}>বর্তমান সময়: {editingPrayer.time || editingPrayer.prayer_time}</p>
            </div>
            {editError && <p className="text-red-500 text-sm mb-3">{editError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingPrayer(null)}
                className={`px-4 py-2 border ${bdr} rounded-lg text-sm ${text}`}>বাতিল</button>
              <button onClick={handleSavePrayer} disabled={editSaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${card}`}>
        <div className={`flex items-center justify-between p-4 border-b ${bdr}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className={`font-bold text-lg ${text}`}>Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${sub}`}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition text-left
                ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : `${sub} hover:bg-gray-100`}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.id === 'milad-requests' && pendingMilad > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingMilad}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={`p-4 border-t ${bdr}`}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className={`sticky top-0 z-30 ${card} shadow-sm`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <Menu className={`w-5 h-5 ${sub}`} />
              </button>
              <div className={`hidden md:flex items-center rounded-lg px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent border-none focus:outline-none ml-2 text-sm w-48 ${text}`} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className={`w-5 h-5 ${sub}`} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{adminUser?.name?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${text}`}>{adminUser?.name || 'Admin'}</p>
                  <p className={`text-xs ${sub}`}>{adminUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              {/* ── DASHBOARD ─────────────────────────────────────────────── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'মোট ব্যবহারকারী', value: users.length,     icon: Users,         color: 'bg-blue-100 text-blue-600'       },
                      { label: 'মোট ইভেন্ট',       value: events.length,    icon: Calendar,      color: 'bg-purple-100 text-purple-600'   },
                      { label: 'Pending মিলাদ',     value: pendingMilad,     icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600'   },
                      { label: 'মোট দান',           value: donations.length, icon: HandHeart,     color: 'bg-emerald-100 text-emerald-600' },
                    ].map((s) => (
                      <div key={s.label} className={`${card} rounded-xl p-5 shadow-sm`}>
                        <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                        <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
                        <p className={`text-sm ${sub}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* সাম্প্রতিক দান */}
                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>সাম্প্রতিক দান</h3>
                      <button onClick={() => setActiveTab('donations')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {donations.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো দান নেই</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className={`text-xs ${sub} border-b ${bdr}`}>
                            <th className="text-left pb-2">নাম</th>
                            <th className="text-left pb-2">পরিমাণ</th>
                            <th className="text-left pb-2">ক্যাটাগরি</th>
                            <th className="text-left pb-2">স্ট্যাটাস</th>
                          </tr></thead>
                          <tbody>
                            {donations.slice(0, 5).map((d: any) => (
                              <tr key={d.id} className={`border-b ${bdr}`}>
                                <td className={`py-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                                <td className="py-3 font-medium text-emerald-600">৳{d.amount}</td>
                                <td className={`py-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pending মিলাদ */}
                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>Pending মিলাদ অনুরোধ</h3>
                      <button onClick={() => setActiveTab('milad-requests')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {pendingMilad === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো pending অনুরোধ নেই ✓</p> : (
                      <div className="space-y-3">
                        {miladRequests.filter(m => m.status === 'pending').slice(0, 3).map((m: any) => (
                          <div key={m.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{m.name}</p>
                              <p className={`text-xs ${sub}`}>{m.milad_date} — {m.phone}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">অনুমোদন</button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">বাতিল</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* আসন্ন ইভেন্ট */}
                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>আসন্ন ইভেন্ট</h3>
                      <button onClick={() => setActiveTab('events')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {events.length === 0 ? <p className={`text-center py-6 ${sub}`}>কোনো ইভেন্ট নেই</p> : (
                      <div className="space-y-3">
                        {events.slice(0, 3).map((e: any) => (
                          <div key={e.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{e.event_name}</p>
                              <p className={`text-xs ${sub}`}>{e.event_date} — {e.hijri_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              e.event_type === 'festival'  ? 'bg-green-100 text-green-800' :
                              e.event_type === 'special'   ? 'bg-purple-100 text-purple-800' :
                              e.event_type === 'religious' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-orange-100 text-orange-800'}`}>{e.event_type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── USERS ─────────────────────────────────────────────────── */}
              {activeTab === 'users' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>ব্যবহারকারী ব্যবস্থাপনা</h3>
                  {users.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো ব্যবহারকারী নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম', 'ইমেইল', 'ফোন', 'রোল', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {users.filter(u => !searchQuery ||
                            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((u: any) => (
                            <tr key={u.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{u.name}</td>
                              <td className={`p-3 ${sub}`}>{u.email}</td>
                              <td className={`p-3 ${sub}`}>{u.phone || '-'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{u.is_active ? 'active' : 'inactive'}</span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleToggleUser(u.id, !!u.is_active)}
                                    className="p-1 rounded hover:bg-gray-100" title={u.is_active ? 'Deactivate' : 'Activate'}>
                                    {u.is_active ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                                  </button>
                                  {u.role !== 'admin' && (
                                    <button onClick={() => setDeleteConfirm(u.id)} className="p-1 rounded hover:bg-red-50" title="Delete">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── PRAYER TIMES ───────────────────────────────────────────── */}
              {activeTab === 'prayer-times' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>নামাজের সময়সূচি</h3>
                  {prayerTimes.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো তথ্য নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম (বাংলা)', 'নাম (ইংরেজি)', 'সময়', 'ধরন', 'ক্যাটাগরি', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {prayerTimes.map((p: any) => (
                            <tr key={p.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{p.display_name_bn}</td>
                              <td className={`p-3 ${sub}`}>{p.display_name_en}</td>
                              <td className="p-3 font-bold text-emerald-600 text-base">{p.time || p.prayer_time}</td>
                              <td className={`p-3 ${sub}`}>{p.prayer_type}</td>
                              <td className={`p-3 ${sub}`}>{p.category}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {p.is_active ? 'active' : 'inactive'}
                                </span>
                              </td>
                              <td className="p-3">
                                <button onClick={() => handleOpenEditPrayer(p)}
                                  className="p-1 rounded hover:bg-emerald-50" title="Edit time">
                                  <Edit className="w-4 h-4 text-emerald-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── EVENTS ────────────────────────────────────────────────── */}
              {activeTab === 'events' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${text}`}>ইসলামিক ইভেন্ট</h3>
                    <button onClick={openCreateEvent}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition">
                      <span className="text-lg leading-none font-bold">+</span> নতুন ইভেন্ট
                    </button>
                  </div>
                  {events.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো ইভেন্ট নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['ইভেন্ট', 'তারিখ', 'হিজরি', 'ধরন', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {events.map((e: any) => (
                            <tr key={e.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{e.event_name}</td>
                              <td className={`p-3 ${sub}`}>{e.event_date}</td>
                              <td className={`p-3 ${sub}`}>{e.hijri_date || '-'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  e.event_type === 'festival'   ? 'bg-green-100 text-green-800' :
                                  e.event_type === 'special'    ? 'bg-purple-100 text-purple-800' :
                                  e.event_type === 'historical' ? 'bg-orange-100 text-orange-800' :
                                  e.event_type === 'religious'  ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-blue-100 text-blue-800'}`}>{e.event_type}</span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {e.is_active ? 'active' : 'inactive'}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openEditEvent(e)} className="p-1 rounded hover:bg-emerald-50" title="Edit">
                                    <Edit className="w-4 h-4 text-emerald-600" />
                                  </button>
                                  <button onClick={() => setDeleteEventConfirm(e.id)} className="p-1 rounded hover:bg-red-50" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── MILAD REQUESTS ────────────────────────────────────────── */}
              {activeTab === 'milad-requests' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>মিলাদ অনুরোধ</h3>
                  {miladRequests.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো অনুরোধ নেই</p> : (
                    <div className="space-y-4">
                      {miladRequests.map((m: any) => (
                        <div key={m.id} className={`border ${bdr} rounded-lg p-4`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-semibold ${text}`}>{m.name}</h4>
                              <p className={`text-sm ${sub}`}>{m.phone} — {m.milad_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>{m.status}</span>
                          </div>
                          {m.description && <p className={`text-sm mt-2 ${sub}`}>{m.description}</p>}
                          {m.admin_remark && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-xs text-blue-600">Admin Note: {m.admin_remark}</p>
                            </div>
                          )}
                          {m.status === 'pending' && (
                            <div className="flex justify-end gap-2 mt-3">
                              <button onClick={() => handleMiladStatus(m.id, 'approved')}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> অনুমোদন
                              </button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> বাতিল
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DONATIONS ─────────────────────────────────────────────── */}
              {activeTab === 'donations' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>দানের তালিকা</h3>
                  {donations.length === 0 ? <p className={`text-center py-8 ${sub}`}>কোনো দান নেই</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['Transaction ID', 'নাম', 'পরিমাণ', 'ক্যাটাগরি', 'পদ্ধতি', 'স্ট্যাটাস', 'তারিখ'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {donations.map((d: any) => (
                            <tr key={d.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 text-xs ${sub}`}>{d.tran_id}</td>
                              <td className={`p-3 font-medium ${text}`}>{d.name || 'Anonymous'}</td>
                              <td className="p-3 font-medium text-emerald-600">৳{d.amount}</td>
                              <td className={`p-3 ${sub}`}>{categoryNames[d.category] || d.category}</td>
                              <td className={`p-3 ${sub}`}>{d.payment_method || '-'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.payment_status)}`}>{d.payment_status}</span>
                              </td>
                              <td className={`p-3 ${sub}`}>{d.created_at?.slice(0, 10)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── SETTINGS ──────────────────────────────────────────────── */}
              {activeTab === 'settings' && (
                <div className={`${card} rounded-xl shadow-sm p-6 max-w-xl`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>সেটিংস</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Site Name',  type: 'text',  value: 'Ad-Diin Mosque' },
                      { label: 'Site Email', type: 'email', value: 'info@addiin.com' },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center gap-4">
                        <span className={`text-sm ${sub} w-32 flex-shrink-0`}>{f.label}</span>
                        <input type={f.type} defaultValue={f.value}
                          className={`flex-1 border ${bdr} rounded px-3 py-2 text-sm ${text} focus:outline-none focus:ring-2 focus:ring-emerald-500`} />
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}