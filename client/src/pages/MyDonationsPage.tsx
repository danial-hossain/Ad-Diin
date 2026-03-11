import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Heart,
  Coffee,
  Users,
  TreePine,
  Beef,
  Home,
  Droplets,
  Gift
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

export default function MyDonationsPage() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const API_URL =
        import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000';

      const response = await fetch(
        `${API_URL}/api/v1/payment/user/donations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        const donationsList = data.data.data || [];

        setDonations(donationsList);

        const completed = donationsList.filter(
          (d: Donation) => d.payment_status === 'completed'
        );

        const totalAmount = completed.reduce(
          (sum: number, d: Donation) => sum + Number(d.amount),
          0
        );

        setStats({
          total: data.data.total || 0,
          completed: completed.length,
          pending: donationsList.filter(
            (d: Donation) => d.payment_status === 'pending'
          ).length,
          totalAmount
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
      zakat: <Heart className="w-5 h-5 text-emerald-600" />,
      iftar: <Coffee className="w-5 h-5 text-orange-600" />,
      durjog: <Home className="w-5 h-5 text-red-600" />,
      sitarto: <Droplets className="w-5 h-5 text-blue-600" />,
      gachropon: <TreePine className="w-5 h-5 text-green-600" />,
      kurbani: <Beef className="w-5 h-5 text-amber-600" />,
      orphan: <Users className="w-5 h-5 text-purple-600" />,
      general: <Gift className="w-5 h-5 text-gray-600" />
    };

    return icons[category] || <Gift className="w-5 h-5 text-gray-600" />;
  };

  const getCategoryNameBn = (category: string) => {
    const names: Record<string, string> = {
      zakat: 'যাকাত',
      iftar: 'ইফতার',
      durjog: 'দুর্গত',
      sitarto: 'শীতার্ত',
      gachropon: 'গাছরোপণ',
      kurbani: 'কুরবানি',
      orphan: 'এতিম',
      general: 'সাধারণ'
    };

    return names[category] || category;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> সম্পন্ন
          </span>
        );

      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> প্রক্রিয়াধীন
          </span>
        );

      case 'failed':
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <XCircle className="w-3 h-3" /> ব্যর্থ
          </span>
        );

      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const filteredDonations = donations.filter((d) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/donate')}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h1 className="text-3xl font-bold text-gray-900">আমার দান</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="মোট দান" value={stats.total} />
          <StatCard title="সফল" value={stats.completed} color="green" />
          <StatCard title="প্রক্রিয়াধীন" value={stats.pending} color="yellow" />
          <StatCard
            title="মোট পরিমাণ"
            value={`৳${stats.totalAmount.toFixed(2)}`}
            color="emerald"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            সবগুলো
          </FilterButton>

          <FilterButton
            active={filter === 'completed'}
            onClick={() => setFilter('completed')}
          >
            সফল
          </FilterButton>

          <FilterButton
            active={filter === 'pending'}
            onClick={() => setFilter('pending')}
          >
            প্রক্রিয়াধীন
          </FilterButton>
        </div>

        {/* Donations */}
        {filteredDonations.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid gap-4">
            {filteredDonations.map((donation) => (
              <div
                key={donation.id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      {getCategoryIcon(donation.category)}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {getCategoryNameBn(donation.category)}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {new Date(
                          donation.created_at
                        ).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-2xl font-bold text-emerald-600">
                      ৳{Number(donation.amount).toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400 font-mono">
                      ID: {donation.tran_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
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
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              হিস্টোরি ডাউনলোড করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Components */

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function FilterButton({ children, active, ...props }: any) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ navigate }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-12 text-center">
      <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">কোনো দান পাওয়া যায়নি</h3>
      <p className="text-gray-600 mb-6">আপনি এখনও কোনো দান করেননি</p>

      <button
        onClick={() => navigate('/donate')}
        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        প্রথম দান করুন
      </button>
    </div>
  );
}