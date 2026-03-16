import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Coffee, Users, TreePine, 
  Beef, Home, Droplets, Gift,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface DonationCategory {
  id: string;
  title: string;
  titleBn: string;
  descriptionBn: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  minAmount?: number;
}

const categories: DonationCategory[] = [
  { id: 'zakat',     title: 'Zakat',            titleBn: 'যাকাত',          descriptionBn: 'আপনার যাকাত দিয়ে দরিদ্রদের সহায়তা করুন',        icon: <Heart className="w-8 h-8" />,    color: 'text-emerald-600', bgColor: 'bg-emerald-50', minAmount: 100 },
  { id: 'iftar',     title: 'Iftar',             titleBn: 'ইফতার',          descriptionBn: 'রমজানে রোজাদারদের ইফতার করান',                   icon: <Coffee className="w-8 h-8" />,   color: 'text-orange-600',  bgColor: 'bg-orange-50',  minAmount: 50  },
  { id: 'durjog',    title: 'Disaster Relief',   titleBn: 'দুর্গত',         descriptionBn: 'প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের সহায়তা',      icon: <Home className="w-8 h-8" />,     color: 'text-red-600',     bgColor: 'bg-red-50',     minAmount: 100 },
  { id: 'sitarto',   title: 'Winter Clothes',    titleBn: 'শীতার্ত',        descriptionBn: 'শীতার্তদের শীতবস্ত্র দিন',                        icon: <Droplets className="w-8 h-8" />, color: 'text-blue-600',    bgColor: 'bg-blue-50',    minAmount: 50  },
  { id: 'gachropon', title: 'Tree Plantation',   titleBn: 'গাছরোপণ',        descriptionBn: 'সবুজ ভবিষ্যতের জন্য গাছ লাগান',                  icon: <TreePine className="w-8 h-8" />, color: 'text-green-600',   bgColor: 'bg-green-50',   minAmount: 20  },
  { id: 'kurbani',   title: 'Qurbani',           titleBn: 'কুরবানি',        descriptionBn: 'আপনার কুরবানি আমাদের সাথে সম্পন্ন করুন',         icon: <Beef className="w-8 h-8" />,     color: 'text-amber-600',   bgColor: 'bg-amber-50',   minAmount: 500 },
  { id: 'orphan',    title: 'Orphan Care',       titleBn: 'এতিম',           descriptionBn: 'এতিম শিশুদের সহায়তা করুন',                       icon: <Users className="w-8 h-8" />,    color: 'text-purple-600',  bgColor: 'bg-purple-50',  minAmount: 100 },
  { id: 'general',   title: 'General Donation',  titleBn: 'সাধারণ অনুদান',  descriptionBn: 'আমাদের সাধারণ কল্যাণমূলক কাজে সহায়তা করুন',    icon: <Gift className="w-8 h-8" />,     color: 'text-gray-600',    bgColor: 'bg-gray-50',    minAmount: 50  },
];

interface DonationFundsProps {
  onViewAll?: () => void;
}

export function DonationFunds({ onViewAll }: DonationFundsProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleItems(1);
      else if (window.innerWidth < 1024) setVisibleItems(2);
      else setVisibleItems(3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // ✅ Fix: ReturnType<typeof setInterval> instead of NodeJS.Timeout
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = categories.length - visibleItems;
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, visibleItems]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = categories.length - visibleItems;
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = categories.length - visibleItems;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const handleFundClick = (fund: DonationCategory) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user-login', { state: { from: '/donate' } });
      return;
    }
    navigate('/donate', { state: { selectedCategory: fund.id, showPayment: true } });
  };

  const visibleCategories = categories.slice(currentIndex, currentIndex + visibleItems);
  const maxIndex = categories.length - visibleItems;

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-900">Donation Funds</h2>
          <button
            onClick={onViewAll || (() => navigate('/donate'))}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            View All
          </button>
        </div>

        <div className="relative">
          <button
            onClick={handlePrev}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition hidden md:block"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition hidden md:block"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
            {visibleCategories.map((fund) => (
              <div
                key={fund.id}
                className="bg-emerald-50 p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleFundClick(fund)}
              >
                <div className={`${fund.color} mb-3`}>{fund.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{fund.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{fund.descriptionBn}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">ন্যূনতম: ৳{fund.minAmount}</span>
                  <span className="text-emerald-600 text-sm font-medium">দান করুন →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots - Mobile only */}
        <div className="flex justify-center mt-6 gap-2 md:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-emerald-600' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden hidden md:block">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}