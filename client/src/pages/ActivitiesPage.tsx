import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_ENDPOINT || 'http://127.0.0.1:8000';

const categoryLabels: Record<string, string> = {
  education: 'শিক্ষা',
  charity: 'দাতব্য',
  youth: 'যুব কার্যক্রম',
  social: 'সামাজিক',
  religious: 'ধর্মীয়',
  other: 'অন্যান্য',
};

const categoryColors: Record<string, string> = {
  education:  'bg-blue-100 text-blue-700',
  charity:    'bg-emerald-100 text-emerald-700',
  youth:      'bg-purple-100 text-purple-700',
  social:     'bg-orange-100 text-orange-700',
  religious:  'bg-amber-100 text-amber-700',
  other:      'bg-gray-100 text-gray-700',
};

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/activities`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(r => r.json())
      .then(d => {
        const data = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
        setActivities(data.filter((a: any) => a.is_active));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-emerald-700 py-16 px-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-3">আমাদের কার্যক্রম</h1>
        <p className="text-emerald-100 max-w-xl mx-auto text-sm">
          আমরা সমাজের উন্নয়নে বিভিন্ন কার্যক্রম পরিচালনা করি। নিচে আমাদের চলমান কার্যক্রমগুলো দেখুন।
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">কোনো কার্যক্রম পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                {activity.image_url ? (
                  <div className="overflow-hidden h-52">
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-52 bg-emerald-50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="p-5">
                  {activity.category && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${categoryColors[activity.category] || 'bg-gray-100 text-gray-600'}`}>
                      {categoryLabels[activity.category] || activity.category}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate(-1)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition font-medium"
          >
            ← ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}