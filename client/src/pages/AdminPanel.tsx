import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HandHeart, Calendar,
  Settings, LogOut, Search, Menu, X,
  UserCheck, UserX, MessageSquare,
  CheckCircle, XCircle, Loader2, BookOpen,
  Moon, Sun, Trash2
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

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
        setPrayerTimes(toArray(d.data || d));
      } else if (tab === 'events') {
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', headers: authHeaders() });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/user-login');
    }
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: isActive ? 0 : 1 })
      });
      const d = await r.json();
      if (d.success) {
        setUsers(prev => prev.map(u => u.id == userId ? { ...u, is_active: isActive ? 0 : 1 } : u));
      }
    } catch (err) { console.error(err); }
  };

  // ✅ Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const d = await r.json();
      if (d.success) {
        setUsers(prev => prev.filter(u => u.id != userId));
        setDeleteConfirm(null);
      } else {
        alert(d.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleMiladStatus = async (id: string, status: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/admin/milads/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (d.success) {
        setMiladRequests(prev => prev.map(m => m.id == id ? { ...m, status } : m));
      }
    } catch (err) { console.error(err); }
  };

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

      {/* ✅ Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${card} rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-2 ${text}`}>ব্যবহারকারী মুছবেন?</h3>
            <p className={`text-sm mb-6 ${sub}`}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={`px-4 py-2 border ${bdr} rounded-lg text-sm hover:bg-gray-50`}>বাতিল</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${card}`}>
        <div className={`flex items-center justify-between p-4 border-b ${bdr}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className={`font-bold text-lg ${text}`}>Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${sub}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition text-left
                ${activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : `${sub} hover:bg-gray-100`}`}>
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
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Topbar */}
        <header className={`sticky top-0 z-40 ${card} shadow-sm`}>
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
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'মোট ব্যবহারকারী', value: users.length,     icon: Users,        color: 'bg-blue-100 text-blue-600'       },
                      { label: 'মোট ইভেন্ট',       value: events.length,    icon: Calendar,     color: 'bg-purple-100 text-purple-600'   },
                      { label: 'Pending মিলাদ',     value: pendingMilad,     icon: MessageSquare,color: 'bg-yellow-100 text-yellow-600'   },
                      { label: 'মোট দান',           value: donations.length, icon: HandHeart,    color: 'bg-emerald-100 text-emerald-600' },
                    ].map((s) => (
                      <div key={s.label} className={`${card} rounded-xl p-5 shadow-sm`}>
                        <div className={`inline-flex p-2 rounded-lg mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                        <p className={`text-2xl font-bold ${text}`}>{s.value}</p>
                        <p className={`text-sm ${sub}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>সাম্প্রতিক দান</h3>
                      <button onClick={() => setActiveTab('donations')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {donations.length === 0 ? (
                      <p className={`text-center py-6 ${sub}`}>কোনো দান নেই</p>
                    ) : (
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

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>Pending মিলাদ অনুরোধ</h3>
                      <button onClick={() => setActiveTab('milad-requests')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {pendingMilad === 0 ? (
                      <p className={`text-center py-6 ${sub}`}>কোনো pending অনুরোধ নেই ✓</p>
                    ) : (
                      <div className="space-y-3">
                        {miladRequests.filter(m => m.status === 'pending').slice(0, 3).map((m: any) => (
                          <div key={m.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{m.name}</p>
                              <p className={`text-xs ${sub}`}>{m.milad_date} — {m.phone}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">অনুমোদন</button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">বাতিল</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`${card} rounded-xl shadow-sm p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${text}`}>আসন্ন ইভেন্ট</h3>
                      <button onClick={() => setActiveTab('events')} className="text-emerald-600 text-sm hover:underline">সব দেখুন</button>
                    </div>
                    {events.length === 0 ? (
                      <p className={`text-center py-6 ${sub}`}>কোনো ইভেন্ট নেই</p>
                    ) : (
                      <div className="space-y-3">
                        {events.slice(0, 3).map((e: any) => (
                          <div key={e.id} className={`flex items-center justify-between p-3 border ${bdr} rounded-lg`}>
                            <div>
                              <p className={`font-medium ${text}`}>{e.event_name}</p>
                              <p className={`text-xs ${sub}`}>{e.event_date} — {e.hijri_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              e.event_type === 'festival' ? 'bg-green-100 text-green-800' :
                              e.event_type === 'special'  ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'}`}>{e.event_type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>ব্যবহারকারী ব্যবস্থাপনা</h3>
                  {users.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো ব্যবহারকারী নেই</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম', 'ইমেইল', 'ফোন', 'রোল', 'স্ট্যাটাস', 'Action'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {users.filter(u =>
                            !searchQuery ||
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {u.is_active ? 'active' : 'inactive'}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {/* Toggle active/inactive */}
                                  <button onClick={() => handleToggleUser(u.id, !!u.is_active)}
                                    className="p-1 rounded hover:bg-gray-100"
                                    title={u.is_active ? 'Deactivate' : 'Activate'}>
                                    {u.is_active
                                      ? <UserX className="w-4 h-4 text-orange-500" />
                                      : <UserCheck className="w-4 h-4 text-green-500" />}
                                  </button>
                                  {/* ✅ Delete button — admin delete করা যাবে না */}
                                  {u.role !== 'admin' && (
                                    <button onClick={() => setDeleteConfirm(u.id)}
                                      className="p-1 rounded hover:bg-red-50"
                                      title="Delete user">
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

              {/* PRAYER TIMES */}
              {activeTab === 'prayer-times' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>নামাজের সময়সূচি</h3>
                  {prayerTimes.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো তথ্য নেই</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['নাম (বাংলা)', 'নাম (ইংরেজি)', 'সময়', 'ধরন', 'ক্যাটাগরি', 'স্ট্যাটাস'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {prayerTimes.map((p: any) => (
                            <tr key={p.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{p.display_name_bn}</td>
                              <td className={`p-3 ${sub}`}>{p.display_name_en}</td>
                              <td className="p-3 font-medium text-emerald-600">{p.prayer_time}</td>
                              <td className={`p-3 ${sub}`}>{p.prayer_type}</td>
                              <td className={`p-3 ${sub}`}>{p.category}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {p.is_active ? 'active' : 'inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* EVENTS */}
              {activeTab === 'events' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>ইসলামিক ইভেন্ট</h3>
                  {events.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো ইভেন্ট নেই</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>{['ইভেন্ট', 'তারিখ', 'হিজরি', 'ধরন', 'স্ট্যাটাস'].map(h => (
                            <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {events.map((e: any) => (
                            <tr key={e.id} className={`border-b ${bdr}`}>
                              <td className={`p-3 font-medium ${text}`}>{e.event_name}</td>
                              <td className={`p-3 ${sub}`}>{e.event_date}</td>
                              <td className={`p-3 ${sub}`}>{e.hijri_date}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  e.event_type === 'festival'   ? 'bg-green-100 text-green-800' :
                                  e.event_type === 'special'    ? 'bg-purple-100 text-purple-800' :
                                  e.event_type === 'historical' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'}`}>{e.event_type}</span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {e.is_active ? 'active' : 'inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* MILAD REQUESTS */}
              {activeTab === 'milad-requests' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>মিলাদ অনুরোধ</h3>
                  {miladRequests.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো অনুরোধ নেই</p>
                  ) : (
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
                              <button onClick={() => handleMiladStatus(m.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> অনুমোদন
                              </button>
                              <button onClick={() => handleMiladStatus(m.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1">
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

              {/* DONATIONS */}
              {activeTab === 'donations' && (
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`text-xl font-semibold mb-6 ${text}`}>দানের তালিকা</h3>
                  {donations.length === 0 ? (
                    <p className={`text-center py-8 ${sub}`}>কোনো দান নেই</p>
                  ) : (
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

              {/* SETTINGS */}
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