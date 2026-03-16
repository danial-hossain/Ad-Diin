import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, HandHeart, Calendar,
  Settings, LogOut, Bell, Search, Menu, X,
  DollarSign, TrendingUp, Activity, Clock,
  Eye, Download, Filter,
  Edit, Trash2, UserCheck, UserX,
  PlusCircle, PieChart, BarChart3,
  Moon, Sun,
  Home, Coffee, TreePine, Beef, Droplets, Gift, Heart
} from 'lucide-react';

interface DashboardStats {
  totalDonations: number;
  totalDonors: number;
  totalUsers: number;
  pendingRequests: number;
  monthlyGrowth: number;
  activeProjects: number;
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

interface ActivityItem {
  id: string;
  type: 'donation' | 'user' | 'project' | 'system';
  description: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const [stats] = useState<DashboardStats>({
    totalDonations: 1250000,
    totalDonors: 8543,
    totalUsers: 12453,
    pendingRequests: 23,
    monthlyGrowth: 15.8,
    activeProjects: 12
  });

  const [recentDonations] = useState<Donation[]>([
    { id: 'DON-001', donorName: 'Rafiq Ahmed',    donorEmail: 'rafiq@example.com',   amount: 5000,  category: 'Zakat',   status: 'completed',  date: '2024-03-15', paymentMethod: 'SSLCommerz', transactionId: 'TXN123456' },
    { id: 'DON-002', donorName: 'Salma Begum',    donorEmail: 'salma@example.com',   amount: 2500,  category: 'Iftar',   status: 'completed',  date: '2024-03-15', paymentMethod: 'SSLCommerz', transactionId: 'TXN123457' },
    { id: 'DON-003', donorName: 'Hasan Ali',      donorEmail: 'hasan@example.com',   amount: 10000, category: 'Qurbani', status: 'processing', date: '2024-03-14', paymentMethod: 'SSLCommerz', transactionId: 'TXN123458' },
    { id: 'DON-004', donorName: 'Fatema Khan',    donorEmail: 'fatema@example.com',  amount: 1500,  category: 'General', status: 'pending',    date: '2024-03-14', paymentMethod: 'SSLCommerz', transactionId: 'TXN123459' },
    { id: 'DON-005', donorName: 'Kamal Hossain',  donorEmail: 'kamal@example.com',   amount: 3000,  category: 'Orphan',  status: 'failed',     date: '2024-03-13', paymentMethod: 'SSLCommerz', transactionId: 'TXN123460' },
    { id: 'DON-006', donorName: 'Nazma Begum',    donorEmail: 'nazma@example.com',   amount: 7000,  category: 'Zakat',   status: 'completed',  date: '2024-03-13', paymentMethod: 'SSLCommerz', transactionId: 'TXN123461' },
    { id: 'DON-007', donorName: 'Shahidul Islam', donorEmail: 'shahidul@example.com',amount: 2000,  category: 'Iftar',   status: 'completed',  date: '2024-03-12', paymentMethod: 'SSLCommerz', transactionId: 'TXN123462' },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 'USR-001', name: 'Rafiq Ahmed',    email: 'rafiq@example.com',    phone: '01712345678', role: 'user',      status: 'active',   joinedDate: '2024-01-15', totalDonations: 15000, lastActive: '2024-03-15' },
    { id: 'USR-002', name: 'Salma Begum',    email: 'salma@example.com',    phone: '01812345678', role: 'user',      status: 'active',   joinedDate: '2024-02-01', totalDonations: 7500,  lastActive: '2024-03-14' },
    { id: 'USR-003', name: 'Hasan Ali',      email: 'hasan@example.com',    phone: '01912345678', role: 'moderator', status: 'active',   joinedDate: '2023-12-10', totalDonations: 25000, lastActive: '2024-03-15' },
    { id: 'USR-004', name: 'Fatema Khan',    email: 'fatema@example.com',   phone: '01612345678', role: 'user',      status: 'inactive', joinedDate: '2024-02-20', totalDonations: 0,     lastActive: '2024-03-10' },
    { id: 'USR-005', name: 'Kamal Hossain',  email: 'kamal@example.com',    phone: '01512345678', role: 'admin',     status: 'active',   joinedDate: '2023-11-01', totalDonations: 50000, lastActive: '2024-03-15' },
    { id: 'USR-006', name: 'Nazma Begum',    email: 'nazma@example.com',    phone: '01312345678', role: 'user',      status: 'active',   joinedDate: '2024-02-28', totalDonations: 7000,  lastActive: '2024-03-13' },
    { id: 'USR-007', name: 'Shahidul Islam', email: 'shahidul@example.com', phone: '01412345678', role: 'user',      status: 'active',   joinedDate: '2024-03-01', totalDonations: 2000,  lastActive: '2024-03-12' },
  ]);

  const [categories] = useState<Category[]>([
    { id: 'zakat',   name: 'Zakat',            nameBn: 'যাকাত',   icon: 'Heart',    totalRaised: 450000, goal: 1000000, donors: 1250, status: 'active' },
    { id: 'iftar',   name: 'Iftar',            nameBn: 'ইফতার',   icon: 'Coffee',   totalRaised: 125000, goal: 200000,  donors: 850,  status: 'active' },
    { id: 'orphan',  name: 'Orphan Care',      nameBn: 'এতিম',    icon: 'Users',    totalRaised: 280000, goal: 500000,  donors: 620,  status: 'active' },
    { id: 'qurbani', name: 'Qurbani',          nameBn: 'কুরবানি', icon: 'Beef',     totalRaised: 350000, goal: 500000,  donors: 180,  status: 'active' },
    { id: 'disaster',name: 'Disaster Relief',  nameBn: 'দুর্গত',  icon: 'Home',     totalRaised: 180000, goal: 300000,  donors: 420,  status: 'active' },
    { id: 'winter',  name: 'Winter Clothes',   nameBn: 'শীতার্ত', icon: 'Droplets', totalRaised: 95000,  goal: 150000,  donors: 310,  status: 'active' },
    { id: 'tree',    name: 'Tree Plantation',  nameBn: 'গাছরোপণ', icon: 'TreePine', totalRaised: 45000,  goal: 100000,  donors: 230,  status: 'active' },
    { id: 'general', name: 'General Donation', nameBn: 'সাধারণ',  icon: 'Gift',     totalRaised: 75000,  goal: 200000,  donors: 520,  status: 'active' },
  ]);

  const [activities] = useState<ActivityItem[]>([
    { id: 'ACT-001', type: 'donation', description: 'New donation of ৳5,000 received',  user: 'Rafiq Ahmed',   timestamp: '5 minutes ago',  status: 'success' },
    { id: 'ACT-002', type: 'user',     description: 'New user registered',               user: 'Salma Begum',   timestamp: '15 minutes ago', status: 'info'    },
    { id: 'ACT-003', type: 'system',   description: 'Payment gateway sync completed',    user: 'System',        timestamp: '1 hour ago',     status: 'success' },
    { id: 'ACT-004', type: 'donation', description: 'Donation #DON-003 is processing',   user: 'Hasan Ali',     timestamp: '2 hours ago',    status: 'warning' },
    { id: 'ACT-005', type: 'donation', description: 'Payment failed for #DON-005',       user: 'Kamal Hossain', timestamp: '3 hours ago',    status: 'error'   },
    { id: 'ACT-006', type: 'project',  description: 'New project: Winter Clothes Drive', user: 'Admin',         timestamp: '5 hours ago',    status: 'success' },
    { id: 'ACT-007', type: 'system',   description: 'Database backup completed',         user: 'System',        timestamp: '12 hours ago',   status: 'info'    },
  ]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/user-login');
    }
  }, [navigate]);

  // ✅ Logout — API call করে is_active = 0, তারপর localStorage clear
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

  // ✅ User active/inactive toggle
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
        // ✅ Local state update করো
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u)
        );
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'active': case 'success': return 'bg-green-100 text-green-800';
      case 'processing': case 'info':  return 'bg-blue-100 text-blue-800';
      case 'pending':   case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'error': case 'blocked': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default:         return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation': return <HandHeart className="w-5 h-5 text-green-600" />;
      case 'user':     return <Users className="w-5 h-5 text-blue-600" />;
      case 'project':  return <Calendar className="w-5 h-5 text-purple-600" />;
      default:         return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':    return <Heart className="w-5 h-5" />;
      case 'Coffee':   return <Coffee className="w-5 h-5" />;
      case 'Users':    return <Users className="w-5 h-5" />;
      case 'Beef':     return <Beef className="w-5 h-5" />;
      case 'Home':     return <Home className="w-5 h-5" />;
      case 'Droplets': return <Droplets className="w-5 h-5" />;
      case 'TreePine': return <TreePine className="w-5 h-5" />;
      default:         return <Gift className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const bg     = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const card   = darkMode ? 'bg-gray-800' : 'bg-white';
  const text   = darkMode ? 'text-white'  : 'text-gray-900';
  const sub    = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const sidebarItems = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'donations',  label: 'Donations',  icon: HandHeart       },
    { id: 'users',      label: 'Users',      icon: Users           },
    { id: 'categories', label: 'Categories', icon: PieChart        },
    { id: 'activities', label: 'Activities', icon: Activity        },
    { id: 'reports',    label: 'Reports',    icon: BarChart3       },
    { id: 'settings',   label: 'Settings',   icon: Settings        },
  ];

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

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
                  ? 'bg-emerald-50 text-emerald-700'
                  : `${sub} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'donations' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {recentDonations.filter(d => d.status === 'pending').length}
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

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Top bar */}
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

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Donations', value: formatCurrency(stats.totalDonations), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', note: '+12.5%' },
                  { label: 'Total Donors',    value: stats.totalDonors.toLocaleString(),   icon: Users,      color: 'bg-blue-100 text-blue-600',       note: '+234'   },
                  { label: 'Total Users',     value: stats.totalUsers.toLocaleString(),    icon: UserCheck,  color: 'bg-purple-100 text-purple-600',   note: '+89'    },
                  { label: 'Pending',         value: stats.pendingRequests.toString(),     icon: Clock,      color: 'bg-yellow-100 text-yellow-600',   note: 'Needs attention' },
                  { label: 'Growth',          value: `${stats.monthlyGrowth}%`,            icon: TrendingUp, color: 'bg-green-100 text-green-600',     note: 'Monthly' },
                  { label: 'Projects',        value: stats.activeProjects.toString(),      icon: Calendar,   color: 'bg-indigo-100 text-indigo-600',   note: 'Active'  },
                ].map((s) => (
                  <div key={s.label} className={`${card} rounded-xl p-4 shadow-sm`}>
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs ${sub}`}>{s.label}</p>
                    <p className={`text-lg font-bold ${text}`}>{s.value}</p>
                    <p className="text-xs text-emerald-500 mt-1">{s.note}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 ${card} rounded-xl shadow-sm p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${text}`}>Recent Donations</h3>
                    <button onClick={() => setActiveTab('donations')} className="text-emerald-600 text-sm hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`text-xs ${sub} border-b ${border}`}>
                          <th className="text-left pb-2">Donor</th>
                          <th className="text-left pb-2">Amount</th>
                          <th className="text-left pb-2">Category</th>
                          <th className="text-left pb-2">Status</th>
                          <th className="text-left pb-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDonations.slice(0, 5).map((d) => (
                          <tr key={d.id} className={`border-b ${border}`}>
                            <td className="py-3">
                              <p className={`font-medium ${text}`}>{d.donorName}</p>
                              <p className={`text-xs ${sub}`}>{d.donorEmail}</p>
                            </td>
                            <td className="py-3 font-medium text-emerald-600">{formatCurrency(d.amount)}</td>
                            <td className={`py-3 ${sub}`}>{d.category}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>{d.status}</span>
                            </td>
                            <td className={`py-3 ${sub}`}>{d.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`${card} rounded-xl shadow-sm p-6`}>
                  <h3 className={`font-semibold mb-4 ${text}`}>Recent Activities</h3>
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{getActivityIcon(a.type)}</div>
                        <div className="flex-1">
                          <p className={`text-sm ${text}`}>{a.description}</p>
                          <p className={`text-xs ${sub} mt-0.5`}>{a.timestamp}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(a.status)}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('activities')} className="mt-4 text-emerald-600 text-sm hover:underline w-full text-center">View All</button>
                </div>
              </div>

              <div className={`${card} rounded-xl shadow-sm p-6`}>
                <h3 className={`font-semibold mb-4 ${text}`}>Campaign Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.slice(0, 4).map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{getCategoryIcon(cat.icon)}</span>
                          <span className={`text-sm font-medium ${text}`}>{cat.nameBn} ({cat.name})</span>
                        </div>
                        <span className={`text-xs ${sub}`}>{formatCurrency(cat.totalRaised)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(cat.totalRaised / cat.goal) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${sub}`}>{cat.donors} donors</span>
                        <span className={`text-xs ${sub}`}>{Math.round((cat.totalRaised / cat.goal) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DONATIONS */}
          {activeTab === 'donations' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>All Donations</h3>
                <div className="flex items-center gap-3">
                  <button className={`flex items-center gap-2 px-4 py-2 border ${border} rounded-lg text-sm hover:bg-gray-50`}><Filter className="w-4 h-4" /> Filter</button>
                  <button className={`flex items-center gap-2 px-4 py-2 border ${border} rounded-lg text-sm hover:bg-gray-50`}><Download className="w-4 h-4" /> Export</button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"><PlusCircle className="w-4 h-4" /> Add</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      {['ID','Donor','Amount','Category','Status','Date','Actions'].map(h => (
                        <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((d) => (
                      <tr key={d.id} className={`border-b ${border}`}>
                        <td className={`p-3 ${sub}`}>{d.id}</td>
                        <td className="p-3">
                          <p className={`font-medium ${text}`}>{d.donorName}</p>
                          <p className={`text-xs ${sub}`}>{d.donorEmail}</p>
                        </td>
                        <td className="p-3 font-medium text-emerald-600">{formatCurrency(d.amount)}</td>
                        <td className={`p-3 ${sub}`}>{d.category}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>{d.status}</span></td>
                        <td className={`p-3 ${sub}`}>{d.date}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-6">
                <p className={`text-sm ${sub}`}>Showing {recentDonations.length} entries</p>
                <div className="flex items-center gap-2">
                  {['Previous','1','2','3','Next'].map((p, i) => (
                    <button key={p} className={`px-3 py-1 rounded border text-sm ${i === 1 ? 'bg-emerald-600 text-white border-emerald-600' : `${border} hover:bg-gray-50`}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>User Management</h3>
                <div className="flex items-center gap-3">
                  <button className={`flex items-center gap-2 px-4 py-2 border ${border} rounded-lg text-sm hover:bg-gray-50`}><Filter className="w-4 h-4" /> Filter</button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"><PlusCircle className="w-4 h-4" /> Add User</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      {['User','Role','Status','Joined','Donations','Last Active','Actions'].map(h => (
                        <th key={h} className={`text-left p-3 font-medium ${sub}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b ${border}`}>
                        <td className="p-3">
                          <p className={`font-medium ${text}`}>{u.name}</p>
                          <p className={`text-xs ${sub}`}>{u.email}</p>
                          <p className={`text-xs ${sub}`}>{u.phone}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{u.role}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(u.status)}`}>{u.status}</span>
                        </td>
                        <td className={`p-3 ${sub}`}>{u.joinedDate}</td>
                        <td className={`p-3 ${sub}`}>{formatCurrency(u.totalDonations)}</td>
                        <td className={`p-3 ${sub}`}>{u.lastActive}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                            {/* ✅ Toggle active/inactive — API call করে */}
                            {u.status === 'active' ? (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className="p-1 hover:bg-red-50 rounded"
                                title="Deactivate user"
                              >
                                <UserX className="w-4 h-4 text-red-500" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className="p-1 hover:bg-green-50 rounded"
                                title="Activate user"
                              >
                                <UserCheck className="w-4 h-4 text-green-500" />
                              </button>
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

          {/* CATEGORIES */}
          {activeTab === 'categories' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${text}`}>Donation Categories</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"><PlusCircle className="w-4 h-4" /> Add Category</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className={`border ${border} rounded-lg p-4 hover:shadow-lg transition`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">{getCategoryIcon(cat.icon)}</div>
                        <div>
                          <h4 className={`font-semibold ${text}`}>{cat.name}</h4>
                          <p className={`text-sm ${sub}`}>{cat.nameBn}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cat.status)}`}>{cat.status}</span>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between"><span className={sub}>Raised:</span><span className={`font-medium ${text}`}>{formatCurrency(cat.totalRaised)}</span></div>
                      <div className="flex justify-between"><span className={sub}>Goal:</span><span className={`font-medium ${text}`}>{formatCurrency(cat.goal)}</span></div>
                      <div className="flex justify-between"><span className={sub}>Donors:</span><span className={`font-medium ${text}`}>{cat.donors}</span></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(cat.totalRaised / cat.goal) * 100}%` }} />
                    </div>
                    <p className={`text-xs ${sub} text-right mt-1`}>{Math.round((cat.totalRaised / cat.goal) * 100)}%</p>
                    <div className="flex justify-end gap-2 mt-2">
                      <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>All Activities</h3>
              <div className="space-y-4">
                {activities.map((a) => (
                  <div key={a.id} className={`flex items-start gap-4 p-4 border ${border} rounded-lg`}>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{getActivityIcon(a.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${text}`}>{a.description}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(a.status)}`}>{a.status}</span>
                      </div>
                      <p className={`text-sm ${sub} mt-1`}>by {a.user}</p>
                      <p className={`text-xs ${sub} mt-0.5`}>{a.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: BarChart3,  color: 'text-emerald-600', title: 'Donation Summary',  desc: 'Monthly donation report'     },
                  { icon: Users,      color: 'text-blue-600',    title: 'User Report',        desc: 'User registration analytics' },
                  { icon: PieChart,   color: 'text-purple-600',  title: 'Category Analysis',  desc: 'Donation by category'        },
                  { icon: Calendar,   color: 'text-orange-600',  title: 'Yearly Report',      desc: 'Annual donation summary'     },
                  { icon: DollarSign, color: 'text-green-600',   title: 'Financial Report',   desc: 'Transaction details'         },
                  { icon: Activity,   color: 'text-red-600',     title: 'Activity Log',       desc: 'System activities'           },
                ].map((r) => (
                  <div key={r.title} className={`border ${border} rounded-lg p-4 hover:shadow-lg transition cursor-pointer`}>
                    <r.icon className={`w-8 h-8 mb-2 ${r.color}`} />
                    <h4 className={`font-semibold ${text}`}>{r.title}</h4>
                    <p className={`text-sm ${sub}`}>{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className={`${card} rounded-xl shadow-sm p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${text}`}>Settings</h3>
              <div className="space-y-6 max-w-xl">
                {[
                  { section: 'General Settings', fields: [
                    { label: 'Site Name',  type: 'text',  value: 'Masjid Donation' },
                    { label: 'Site Email', type: 'email', value: 'info@masjid.com' },
                  ]},
                  { section: 'Payment Settings', fields: [
                    { label: 'Store ID',       type: 'text',     value: 'testbox' },
                    { label: 'Store Password', type: 'password', value: '******'  },
                  ]},
                  { section: 'Email Settings', fields: [
                    { label: 'SMTP Host', type: 'text', value: 'smtp.gmail.com' },
                    { label: 'SMTP Port', type: 'text', value: '587'            },
                  ]},
                ].map((group) => (
                  <div key={group.section} className={`border-b ${border} pb-6`}>
                    <h4 className={`font-semibold mb-4 ${text}`}>{group.section}</h4>
                    <div className="space-y-3">
                      {group.fields.map((f) => (
                        <div key={f.label} className="flex items-center justify-between gap-4">
                          <span className={`text-sm ${sub} w-40 flex-shrink-0`}>{f.label}</span>
                          <input type={f.type} defaultValue={f.value}
                            className={`flex-1 border ${border} rounded px-3 py-2 text-sm ${card} ${text} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
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