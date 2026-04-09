import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, XCircle,
  Download, Heart, Coffee, Users,
  TreePine, Beef, Home, Droplets, Gift
} from 'lucide-react';

interface Donation {
  id: number;
  category: string;
  amount: number;
  currency: string;
  tran_id: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  is_anonymous: boolean;
}

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

export default function MyDonationsPage() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('all');
  const [stats, setStats]         = useState({
    total: 0, completed: 0, pending: 0, totalAmount: 0
  });

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/v1/payment/user/donations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();

      if (data.success) {
        // ✅ FIX: backend এখন flat array পাঠায় — data.data সরাসরি array
        const donationsList: Donation[] = Array.isArray(data.data) ? data.data : [];

        setDonations(donationsList);

        const completed   = donationsList.filter(d => d.payment_status === 'completed');
        const totalAmount = completed.reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          total:       data.meta?.total ?? donationsList.length,
          completed:   completed.length,
          pending:     donationsList.filter(d => d.payment_status === 'pending').length,
          totalAmount,
        });
      } else {
        setError('Failed to load donations');
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      zakat:     <Heart    className="w-5 h-5 text-emerald-600" />,
      iftar:     <Coffee   className="w-5 h-5 text-orange-600"  />,
      durjog:    <Home     className="w-5 h-5 text-red-600"     />,
      sitarto:   <Droplets className="w-5 h-5 text-blue-600"    />,
      gachropon: <TreePine className="w-5 h-5 text-green-600"   />,
      kurbani:   <Beef     className="w-5 h-5 text-amber-600"   />,
      orphan:    <Users    className="w-5 h-5 text-purple-600"  />,
      general:   <Gift     className="w-5 h-5 text-gray-600"    />,
    };
    return icons[category] || <Gift className="w-5 h-5 text-gray-600" />;
  };

  const getCategoryNameBn = (category: string) => {
    const names: Record<string, string> = {
      zakat: 'যাকাত', iftar: 'ইফতার', durjog: 'দুর্গত',
      sitarto: 'শীতার্ত', gachropon: 'গাছরোপণ',
      kurbani: 'কুরবানি', orphan: 'এতিম', general: 'সাধারণ'
    };
    return names[category] || category;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> সম্পন্ন</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> প্রক্রিয়াধীন</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> ব্যর্থ</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> বাতিল</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const filteredDonations = donations.filter(d => {
    if (filter === 'all') return true;
    return d.payment_status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchDonations} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/donate')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">আমার দান</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">মোট দান</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">সফল</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">প্রক্রিয়াধীন</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">মোট পরিমাণ</p>
            <p className="text-2xl font-bold text-emerald-600">৳{stats.totalAmount.toFixed(0)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all',       label: 'সবগুলো'      },
            { key: 'completed', label: 'সফল'          },
            { key: 'pending',   label: 'প্রক্রিয়াধীন' },
            { key: 'failed',    label: 'ব্যর্থ'        },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                filter === f.key ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Donations list */}
        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">কোনো দান পাওয়া যায়নি</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'আপনি এখনও কোনো দান করেননি' : `"${filter}" স্ট্যাটাসে কোনো দান নেই`}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/donate')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                প্রথম দান করুন
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonations.map(donation => (
              <div key={donation.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl flex-shrink-0">
                      {getCategoryIcon(donation.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getCategoryNameBn(donation.category)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString('en-BD', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 md:text-center">
                    <p className="text-2xl font-bold text-emerald-600">৳{Number(donation.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {donation.tran_id}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(donation.payment_status)}
                    <span className="text-sm text-gray-500 capitalize">
                      {donation.payment_method || 'sslcommerz'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDonations.length > 0 && (
          <div className="mt-6 text-right">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> হিস্টোরি ডাউনলোড করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}