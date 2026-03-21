import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, HandHeart, Calendar,
  Settings, LogOut, Bell, Search, Menu, X,
  DollarSign, TrendingUp, Activity, Clock,
  Eye, Download, Filter, Edit, Trash2, 
  UserCheck, UserX, PlusCircle, PieChart, BarChart3,
  Moon, Sun, Home, Coffee, TreePine, Beef, Droplets, 
  Gift, Heart, Clock3, MessageSquare, Phone, Mail,
  MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';

// ==================== INTERFACES ====================
interface DashboardStats {
  totalDonations: number;
  totalDonors: number;
  totalUsers: number;
  pendingMilad: number;
  monthlyGrowth: number;
  activeEvents: number;
}

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  date: string;
  paymentMethod: string;
  transactionId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'blocked';
  joinedDate: string;
  totalDonations: number;
  lastActive: string;
}

interface PrayerTime {
  id: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
}

interface Activity {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image?: string;
}

interface Event {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  image?: string;
}

interface MiladRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestDate: string;
  preferredDate: string;
  preferredTime: string;
  occasion: string;
  guestCount: number;
  specialRequirements: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  totalRaised: number;
  goal: number;
  donors: number;
  status: 'active' | 'paused' | 'completed';
}

// ==================== MAIN COMPONENT ====================
export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(false);

  // ==================== STATE ====================
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 1250000,
    totalDonors: 8543,
    totalUsers: 12453,
    pendingMilad: 12,
    monthlyGrowth: 15.8,
    activeEvents: 5
  });

  const [donations, setDonations] = useState<Donation[]>([
    { id: 'DON-001', donorName: 'Rafiq Ahmed', donorEmail: 'rafiq@example.com', amount: 5000, category: 'Zakat', status: 'completed', date: '2024-03-15', paymentMethod: 'SSLCommerz', transactionId: 'TXN123456' },
    { id: 'DON-002', donorName: 'Salma Begum', donorEmail: 'salma@example.com', amount: 2500, category: 'Iftar', status: 'completed', date: '2024-03-15', paymentMethod: 'SSLCommerz', transactionId: 'TXN123457' },
    { id: 'DON-003', donorName: 'Hasan Ali', donorEmail: 'hasan@example.com', amount: 10000, category: 'Qurbani', status: 'processing', date: '2024-03-14', paymentMethod: 'SSLCommerz', transactionId: 'TXN123458' },
    { id: 'DON-004', donorName: 'Fatema Khan', donorEmail: 'fatema@example.com', amount: 1500, category: 'General', status: 'pending', date: '2024-03-14', paymentMethod: 'SSLCommerz', transactionId: 'TXN123459' },
    { id: 'DON-005', donorName: 'Kamal Hossain', donorEmail: 'kamal@example.com', amount: 3000, category: 'Orphan', status: 'failed', date: '2024-03-13', paymentMethod: 'SSLCommerz', transactionId: 'TXN123460' },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 'USR-001', name: 'Rafiq Ahmed', email: 'rafiq@example.com', phone: '01712345678', role: 'user', status: 'active', joinedDate: '2024-01-15', totalDonations: 15000, lastActive: '2024-03-15' },
    { id: 'USR-002', name: 'Salma Begum', email: 'salma@example.com', phone: '01812345678', role: 'user', status: 'active', joinedDate: '2024-02-01', totalDonations: 7500, lastActive: '2024-03-14' },
    { id: 'USR-003', name: 'Kamal Hossain', email: 'kamal@example.com', phone: '01512345678', role: 'admin', status: 'active', joinedDate: '2023-11-01', totalDonations: 50000, lastActive: '2024-03-15' },
  ]);

  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { id: '1', date: '2024-03-21', fajr: '5:00', sunrise: '6:15', dhuhr: '12:00', asr: '3:30', maghrib: '6:00', isha: '7:15', jummah: '1:00' },
    { id: '2', date: '2024-03-22', fajr: '4:58', sunrise: '6:13', dhuhr: '12:00', asr: '3:30', maghrib: '6:01', isha: '7:16', jummah: '1:00' },
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: 'ACT-001', title: 'Weekly Tafsir Class', titleBn: 'সাপ্তাহিক তাফসীর ক্লাস', description: 'Learn Quran Tafsir', date: '2024-03-22', time: '4:00 PM', location: 'Main Hall', status: 'upcoming' },
    { id: 'ACT-002', title: 'Quran Recitation Competition', titleBn: 'কুরআন তেলাওয়াত প্রতিযোগিতা', description: 'For children', date: '2024-03-25', time: '3:00 PM', location: 'Auditorium', status: 'upcoming' },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: 'EVT-001', title: 'Ramadan Iftar Program', titleBn: 'রমজান ইফতার মাহফিল', description: 'Community Iftar', date: '2024-03-25', time: '5:30 PM', location: 'Mosque Courtyard', capacity: 500, registered: 320, status: 'upcoming' },
    { id: 'EVT-002', title: 'Eid Jamaat', titleBn: 'ঈদের জামাত', description: 'Eid Prayer', date: '2024-04-10', time: '8:00 AM', location: 'Main Prayer Hall', capacity: 1000, registered: 850, status: 'upcoming' },
  ]);

  const [miladRequests, setMiladRequests] = useState<MiladRequest[]>([
    { id: 'MIL-001', userName: 'Rafiq Ahmed', userEmail: 'rafiq@example.com', userPhone: '01712345678', requestDate: '2024-03-15', preferredDate: '2024-03-25', preferredTime: '8:00 PM', occasion: 'Birthday', guestCount: 50, specialRequirements: 'None', status: 'pending', createdAt: '2024-03-15' },
    { id: 'MIL-002', userName: 'Salma Begum', userEmail: 'salma@example.com', userPhone: '01812345678', requestDate: '2024-03-14', preferredDate: '2024-03-28', preferredTime: '7:00 PM', occasion: 'Wedding Anniversary', guestCount: 100, specialRequirements: 'Need microphone', status: 'approved', adminNotes: 'Approved for Main Hall', createdAt: '2024-03-14' },
  ]);

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([
    { id: 'MSG-001', name: 'Abdul Karim', email: 'karim@example.com', phone: '01712345678', subject: 'Donation Inquiry', message: 'How can I donate?', status: 'unread', createdAt: '2024-03-20' },
    { id: 'MSG-002', name: 'Fatema Begum', email: 'fatema@example.com', phone: '01812345678', subject: 'Event Registration', message: 'I want to register for Iftar', status: 'read', createdAt: '2024-03-19' },
  ]);

  const [categories] = useState<Category[]>([
    { id: 'zakat', name: 'Zakat', nameBn: 'যাকাত', icon: 'Heart', totalRaised: 450000, goal: 1000000, donors: 1250, status: 'active' },
    { id: 'iftar', name: 'Iftar', nameBn: 'ইফতার', icon: 'Coffee', totalRaised: 125000, goal: 200000, donors: 850, status: 'active' },
  ]);

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/user-login');
    }
  }, [navigate]);

  // ==================== API CALLS ====================
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8000/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/user-login');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const token = localStorage.getItem('token');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleUpdateMiladStatus = async (requestId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/milad/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMiladRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus as MiladRequest['status'] } : r));
      } else {
        alert(data.message || 'Failed to update milad request');
      }
    } catch (err) {
      console.error('Update milad status error:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/contact/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setContactMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'read' as const } : m));
      }
    } catch (err) {
      console.error('Mark message read error:', err);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'active': case 'success': case 'approved': return 'bg-green-100 text-green-800';
      case 'processing': case 'info': case 'read': return 'bg-blue-100 text-blue-800';
      case 'pending': case 'warning': case 'unread': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'error': case 'blocked': case 'rejected': return 'bg-red-100 text-red-800';
      case 'inactive': case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  // ==================== SIDEBAR ITEMS ====================
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Users', icon: Users, badge: null },
    { id: 'prayer-times', label: 'Prayer Time', icon: Clock3, badge: null },
    { id: 'activities', label: 'Activities', icon: Activity, badge: null },
    { id: 'events', label: 'Events', icon: Calendar, badge: stats.activeEvents },
    { id: 'milad-requests', label: 'Milad Requests', icon: MessageSquare, badge: stats.pendingMilad },
    { id: 'donations', label: 'Donations', icon: HandHeart, badge: null },
    { id: 'contacts', label: 'Contacts', icon: Phone, badge: contactMessages.filter(m => m.status === 'unread').length },
    { id: 'categories', label: 'Categories', icon: PieChart, badge: null },
    { id: 'reports', label: 'Reports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen ${bg} flex`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${card}`}>
        
        <div className={`flex items-center justify-between p-4 border-b ${border}`}>
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
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition text-left
                ${activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : `${sub} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${border}`}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className={`sticky top-0 z-40 ${card} shadow-sm`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <Menu className={`w-5 h-5 ${sub}`} />
              </button>
              <div className={`hidden md:flex items-center rounded-lg px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent border-none focus:outline-none ml-2 text-sm w-64 ${text}`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`rounded-lg px-3 py-2 text-sm border-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <Bell className={`w-5 h-5 ${sub}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className={`w-5 h-5 ${sub}`} />}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{adminUser?.name?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${text}`}>{adminUser?.name || 'Admin'}</p>
                  <p className={`text-xs ${sub}`}>{adminUser?.email || 'admin@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* ==================== DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Donations', value: formatCurrency(stats.totalDonations), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
                  { label: 'Total Donors', value: stats.totalDonors.toLocaleString(), icon: Users, color: 'bg-blue-100 text-blue-600' },
                  { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: UserCheck, color: 'bg-purple-100 text-purple-600' },
                  { label: 'Pending Milad', value: stats.pendingMilad.toString(), icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600' },
                  { label: 'Active Events', value: stats.activeEvents.toString(), icon: Calendar, color: 'bg-indigo-100 text-indigo-600' },
                  { label: 'Growth', value: `${stats.monthlyGrowth}%`, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
                ].map((s) => (
                  <div key={s.label} className={`${card} rounded-xl p-4 shadow-sm`}>
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs ${sub}`}>{s.label}</p>
                    <p className={`text-lg font-bold ${text}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`font-semibold mb-4 ${text}`}>Recent Donations</h3>
                  <div className="space-y-3">
                    {donations.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex justify-between items-center p-3 border-b border-gray-100">
                        <div>
                          <p className={`font-medium ${text}`}>{d.donorName}</p>
                          <p className={`text-xs ${sub}`}>{d.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">{formatCurrency(d.amount)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(d.status)}`}>{d.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`font-semibold mb-4 ${text}`}>Recent Milad Requests</h3>
                  <div className="space-y-3">
                    {miladRequests.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex justify-between items-center p-3 border-b border-gray-100">
                        <div>
                          <p className={`font-medium ${text}`}>{r.userName}</p>
                          <p className={`text-xs ${sub}`}>{r.preferredDate} at {r.preferredTime}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(r.status)}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== USERS ==================== */}
          {activeTab === 'users' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>User Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>{['User', 'Role', 'Status', 'Joined', 'Donations', 'Actions'].map(h => <th key={h} className={`text-left p-3 ${sub}`}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b ${border}`}>
                        <td className="p-3"><p className={`font-medium ${text}`}>{u.name}</p><p className={`text-xs ${sub}`}>{u.email}</p></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(u.status)}`}>{u.status}</span></td>
                        <td className={`p-3 text-sm ${sub}`}>{u.joinedDate}</td>
                        <td className={`p-3 text-sm ${sub}`}>{formatCurrency(u.totalDonations)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                            {u.status === 'active' ? (
                              <button onClick={() => handleToggleUserStatus(u.id, u.status)}><UserX className="w-4 h-4 text-red-500" /></button>
                            ) : (
                              <button onClick={() => handleToggleUserStatus(u.id, u.status)}><UserCheck className="w-4 h-4 text-green-500" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PRAYER TIME ==================== */}
          {activeTab === 'prayer-times' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Prayer Time Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Add Schedule
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>{['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jummah', 'Actions'].map(h => <th key={h} className={`text-left p-3 ${sub}`}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {prayerTimes.map((p) => (
                      <tr key={p.id} className={`border-b ${border}`}>
                        <td className={`p-3 ${text}`}>{p.date}</td>
                        <td className={`p-3 ${text}`}>{p.fajr}</td>
                        <td className={`p-3 ${text}`}>{p.sunrise}</td>
                        <td className={`p-3 ${text}`}>{p.dhuhr}</td>
                        <td className={`p-3 ${text}`}>{p.asr}</td>
                        <td className={`p-3 ${text}`}>{p.maghrib}</td>
                        <td className={`p-3 ${text}`}>{p.isha}</td>
                        <td className={`p-3 ${text}`}>{p.jummah}</td>
                        <td className="p-3"><button className="p-1"><Edit className="w-4 h-4 text-blue-500" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== ACTIVITIES ==================== */}
          {activeTab === 'activities' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Activities Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Add Activity
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((a) => (
                  <div key={a.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${text}`}>{a.title}</h4>
                        <p className={`text-sm ${sub}`}>{a.titleBn}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(a.status)}`}>{a.status}</span>
                    </div>
                    <p className={`text-sm mt-2 ${sub}`}>{a.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>📅 {a.date}</span>
                      <span>⏰ {a.time}</span>
                      <span>📍 {a.location}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button className="p-1"><Edit className="w-4 h-4 text-blue-500" /></button>
                      <button className="p-1"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== EVENTS ==================== */}
          {activeTab === 'events' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Events Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Create Event
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((e) => (
                  <div key={e.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex justify-between">
                      <h4 className={`font-semibold ${text}`}>{e.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(e.status)}`}>{e.status}</span>
                    </div>
                    <p className={`text-sm mt-1 ${sub}`}>{e.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>📅 {e.date}</span>
                      <span>⏰ {e.time}</span>
                      <span>📍 {e.location}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(e.registered / e.capacity) * 100}%` }} />
                      </div>
                      <span className={`text-xs ${sub}`}>{e.registered}/{e.capacity}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button className="p-1"><Edit className="w-4 h-4 text-blue-500" /></button>
                      <button className="p-1"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MILAD REQUESTS ==================== */}
          {activeTab === 'milad-requests' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>Milad Requests Management</h3>
              <div className="space-y-4">
                {miladRequests.map((r) => (
                  <div key={r.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${text}`}>{r.userName}</h4>
                        <p className={`text-sm ${sub}`}>{r.userEmail} | {r.userPhone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div><span className={sub}>Preferred Date:</span> <span className={text}>{r.preferredDate}</span></div>
                      <div><span className={sub}>Time:</span> <span className={text}>{r.preferredTime}</span></div>
                      <div><span className={sub}>Occasion:</span> <span className={text}>{r.occasion}</span></div>
                      <div><span className={sub}>Guests:</span> <span className={text}>{r.guestCount}</span></div>
                    </div>
                    {r.specialRequirements && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <span className={`text-xs ${sub}`}>Special Requirements:</span>
                        <p className={`text-sm ${text}`}>{r.specialRequirements}</p>
                      </div>
                    )}
                    {r.adminNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <span className={`text-xs text-blue-600`}>Admin Notes:</span>
                        <p className={`text-sm text-blue-800`}>{r.adminNotes}</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateMiladStatus(r.id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 inline mr-1" /> Approve
                          </button>
                          <button onClick={() => handleUpdateMiladStatus(r.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                            <XCircle className="w-4 h-4 inline mr-1" /> Reject
                          </button>
                        </>
                      )}
                      <button className="p-1"><Edit className="w-4 h-4 text-blue-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== DONATIONS ==================== */}
          {activeTab === 'donations' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Donations Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>{['ID', 'Donor', 'Amount', 'Category', 'Status', 'Date', 'Actions'].map(h => <th key={h} className={`text-left p-3 ${sub}`}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className={`border-b ${border}`}>
                        <td className={`p-3 ${sub}`}>{d.id}</td>
                        <td className="p-3"><p className={text}>{d.donorName}</p><p className={`text-xs ${sub}`}>{d.donorEmail}</p></td>
                        <td className="p-3 font-medium text-emerald-600">{formatCurrency(d.amount)}</td>
                        <td className={`p-3 ${sub}`}>{d.category}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(d.status)}`}>{d.status}</span></td>
                        <td className={`p-3 ${sub}`}>{d.date}</td>
                        <td className="p-3"><button className="p-1"><Eye className="w-4 h-4 text-gray-500" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== CONTACTS ==================== */}
          {activeTab === 'contacts' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>Contact Messages</h3>
              <div className="space-y-4">
                {contactMessages.map((m) => (
                  <div key={m.id} className={`border ${border} rounded-lg p-4 ${m.status === 'unread' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${text}`}>{m.name}</h4>
                        <div className="flex gap-3 text-sm mt-1">
                          <span className={sub}><Mail className="w-3 h-3 inline mr-1" />{m.email}</span>
                          <span className={sub}><Phone className="w-3 h-3 inline mr-1" />{m.phone}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(m.status)}`}>{m.status}</span>
                    </div>
                    <div className="mt-2">
                      <p className={`text-sm font-medium ${text}`}>Subject: {m.subject}</p>
                      <p className={`text-sm ${sub} mt-1`}>{m.message}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      {m.status === 'unread' && (
                        <button onClick={() => handleMarkMessageRead(m.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Mark as Read
                        </button>
                      )}
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                        <Mail className="w-4 h-4 inline mr-1" /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== CATEGORIES ==================== */}
          {activeTab === 'categories' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Donation Categories</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex justify-between">
                      <h4 className={`font-semibold ${text}`}>{cat.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cat.status)}`}>{cat.status}</span>
                    </div>
                    <p className={`text-sm ${sub} mb-2`}>{cat.nameBn}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className={sub}>Raised:</span><span className={text}>{formatCurrency(cat.totalRaised)}</span></div>
                      <div className="flex justify-between"><span className={sub}>Goal:</span><span className={text}>{formatCurrency(cat.goal)}</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(cat.totalRaised / cat.goal) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== REPORTS ==================== */}
          {activeTab === 'reports' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: BarChart3, color: 'text-emerald-600', title: 'Donation Summary', desc: 'Monthly donation report' },
                  { icon: Users, color: 'text-blue-600', title: 'User Report', desc: 'User registration analytics' },
                  { icon: PieChart, color: 'text-purple-600', title: 'Category Analysis', desc: 'Donation by category' },
                  { icon: Calendar, color: 'text-orange-600', title: 'Event Report', desc: 'Event participation summary' },
                  { icon: MessageSquare, color: 'text-pink-600', title: 'Milad Report', desc: 'Milad requests summary' },
                  { icon: DollarSign, color: 'text-green-600', title: 'Financial Report', desc: 'Transaction details' },
                ].map((r) => (
                  <div key={r.title} className={`border ${border} rounded-lg p-4 hover:shadow-lg transition cursor-pointer`}>
                    <r.icon className={`w-8 h-8 mb-2 ${r.color}`} />
                    <h4 className={`font-semibold ${text}`}>{r.title}</h4>
                    <p className={`text-sm ${sub}`}>{r.desc}</p>
                    <button className="mt-3 text-emerald-600 text-sm hover:underline">Generate →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>System Settings</h3>
              <div className="space-y-6 max-w-xl">
                <div className={`border-b ${border} pb-6`}>
                  <h4 className={`font-semibold mb-4 ${text}`}>General Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm ${sub} w-40`}>Site Name</span>
                      <input type="text" defaultValue="Ad-Diin Mosque" className={`flex-1 border ${border} rounded px-3 py-2 text-sm ${card} ${text}`} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm ${sub} w-40`}>Site Email</span>
                      <input type="email" defaultValue="info@addiin.com" className={`flex-1 border ${border} rounded px-3 py-2 text-sm ${card} ${text}`} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button className={`px-4 py-2 border ${border} rounded text-sm hover:bg-gray-50`}>Cancel</button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}