import { useState } from 'react';
import { Heart, DollarSign } from 'lucide-react';

export default function ZakatCalculatorPage() {
  // ----------- input states -----------
  const [cash, setCash] = useState('');
  const [goldWeight, setGoldWeight] = useState(''); // grams
  const [goldPrice, setGoldPrice] = useState(''); // per gram
  const [silverWeight, setSilverWeight] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  const [investments, setInvestments] = useState('');
  const [inventory, setInventory] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  const [debts, setDebts] = useState('');

  // ----------- result states -----------
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [netWealth, setNetWealth] = useState<number | null>(null);
  const [nisabThreshold, setNisabThreshold] = useState<number | null>(null);
  const [eligible, setEligible] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(false);

  const parseNum = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const calculateZakat = () => {
    const cashVal = parseNum(cash);
    const goldVal = parseNum(goldWeight) * parseNum(goldPrice);
    const silverVal = parseNum(silverWeight) * parseNum(silverPrice);
    const invVal = parseNum(investments);
    const invtVal = parseNum(inventory);
    const otherVal = parseNum(otherAssets);
    const debtVal = parseNum(debts);

    const totalAssets = cashVal + goldVal + silverVal + invVal + invtVal + otherVal;
    const net = Math.max(totalAssets - debtVal, 0);

    const nisabGold = 87.48 * parseNum(goldPrice);
    const nisabSilver = 612.36 * parseNum(silverPrice);
    const threshold = Math.min(nisabGold || Infinity, nisabSilver || Infinity);

    const isEligible = net >= threshold && threshold > 0;
    const zakat = isEligible ? net * 0.025 : 0;

    setNetWealth(net);
    setNisabThreshold(threshold);
    setEligible(isEligible);
    setZakatAmount(zakat);
    setShowResult(true);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') calculateZakat();
  };

  const resetResult = () => setShowResult(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      resetResult();
    };

  // Shared number input classes with spinner removed
  const numberInputClass =
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-emerald-500 " +
    "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-spin-button]:appearance-none";

  // Prevent arrow key increment/decrement
  const preventArrowKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-emerald-50/40 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Zakat Calculator
          </h1>
          <p className="text-lg text-slate-600">
            Calculate your Zakat obligation and purify your wealth
          </p>
        </div>

        {/* Zakat Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border-2 border-emerald-100">
          <div className="mb-10 flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-3 rounded-full">
              <Heart size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">What is Zakat?</h2>
          </div>
          <p className="text-slate-700 leading-relaxed ml-12">
            Zakat is one of the Five Pillars of Islam, a mandatory 2.5% contribution of eligible wealth
            to help the needy and purify wealth.
          </p>
        </div>

        {/* Zakat Calculator Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-2 border-emerald-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 text-white p-3 rounded-full">
              <DollarSign size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Calculate Your Zakat</h2>
          </div>

          {/* Inputs */}
          <div className="mb-8 space-y-6">
            <h3 className="text-xl font-bold">Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Cash ( ৳ )', value: cash, setter: setCash },
                { label: 'Gold weight (g)', value: goldWeight, setter: setGoldWeight },
                { label: 'Gold price (৳/g)', value: goldPrice, setter: setGoldPrice },
                { label: 'Silver weight (g)', value: silverWeight, setter: setSilverWeight },
                { label: 'Silver price (৳/g)', value: silverPrice, setter: setSilverPrice },
                { label: 'Investments/Stocks ( ৳ )', value: investments, setter: setInvestments },
                { label: 'Business inventory ( ৳ )', value: inventory, setter: setInventory },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-slate-900 font-medium mb-1">{field.label}</label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={handleChange(field.setter)}
                    onKeyPress={handleEnter}
                    onKeyDown={preventArrowKeys}
                    className={numberInputClass}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-slate-900 font-medium mb-1">Other zakatable assets ( ৳ )</label>
                <input
                  type="number"
                  value={otherAssets}
                  onChange={handleChange(setOtherAssets)}
                  onKeyPress={handleEnter}
                  onKeyDown={preventArrowKeys}
                  className={numberInputClass}
                />
              </div>
            </div>

            <h3 className="text-xl font-bold mt-6">Liabilities</h3>
            <div>
              <label className="block text-slate-900 font-medium mb-1">Debts/owed amount ( ৳ )</label>
              <input
                type="number"
                value={debts}
                onChange={handleChange(setDebts)}
                onKeyPress={handleEnter}
                onKeyDown={preventArrowKeys}
                className={numberInputClass}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={calculateZakat}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Calculate Zakat
            </button>
            <button
              onClick={() => {
                setCash(''); setGoldWeight(''); setGoldPrice('');
                setSilverWeight(''); setSilverPrice('');
                setInvestments(''); setInventory('');
                setOtherAssets(''); setDebts(''); setShowResult(false);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Reset
            </button>
          </div>

          {/* Result */}
          {showResult && (
            <div className="mt-8 space-y-6">
              {!eligible ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 text-yellow-800">
                  <p>
                    You are not yet liable for Zakat. Net wealth of ৳{netWealth?.toLocaleString('en-BD', {maximumFractionDigits:2})} is below nisab threshold ৳{nisabThreshold?.toLocaleString('en-BD', {maximumFractionDigits:2})}.
                  </p>
                </div>
              ) : (
                <div className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-lg mb-2">Your Zakat Amount</p>
                      <p className="text-5xl font-bold">৳ {zakatAmount?.toLocaleString('en-BD', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <Heart size={48} className="text-emerald-100 opacity-50" />
                  </div>
                  <div className="mt-6 pt-6 border-t border-emerald-400 text-emerald-100 text-sm space-y-1">
                    <p>Net wealth: ৳{netWealth?.toLocaleString('en-BD', {maximumFractionDigits:2})}</p>
                    <p>Nisab threshold used: ৳{nisabThreshold?.toLocaleString('en-BD', {maximumFractionDigits:2})}</p>
                    <p className="text-sm opacity-75">(gold nisab @{(87.48 * parseNum(goldPrice)).toLocaleString('en-BD', {maximumFractionDigits:2})}, silver nisab @{(612.36 * parseNum(silverPrice)).toLocaleString('en-BD', {maximumFractionDigits:2})})</p>
                    <p>Rate: 2.5%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}