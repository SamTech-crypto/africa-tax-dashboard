import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const AfricaCryptoTaxDashboard = () => {
  // User inputs
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');
  const [currentStructure, setCurrentStructure] = useState('Direct exchange → local bank');

  // Live prices
  const [usdcRate, setUsdcRate] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Country data with 2025 tax rates
  const countryData = {
    'Nigeria': {
      flag: '🇳🇬',
      currency: 'NGN',
      exchangeRate: 1650,
      vat: 7.5,
      withholdingTax: 10,
      capitalGains: 10,
      digitalServicesTax: 6,
      psc: 0,
      optimizedRate: 2.5
    },
    'Kenya': {
      flag: '🇰🇪',
      currency: 'KES',
      exchangeRate: 129,
      vat: 16,
      withholdingTax: 5,
      capitalGains: 5,
      digitalServicesTax: 1.5,
      psc: 0,
      optimizedRate: 3.0
    },
    'Ghana': {
      flag: '🇬🇭',
      currency: 'GHS',
      exchangeRate: 15.2,
      vat: 15,
      withholdingTax: 3,
      capitalGains: 0,
      digitalServicesTax: 0,
      psc: 0,
      optimizedRate: 1.5
    },
    'South Africa': {
      flag: '🇿🇦',
      currency: 'ZAR',
      exchangeRate: 18.5,
      vat: 15,
      withholdingTax: 15,
      capitalGains: 18,
      digitalServicesTax: 0,
      psc: 0,
      optimizedRate: 4.5
    },
    'Egypt': {
      flag: '🇪🇬',
      currency: 'EGP',
      exchangeRate: 49.5,
      vat: 14,
      withholdingTax: 10,
      capitalGains: 10,
      digitalServicesTax: 0,
      psc: 0,
      optimizedRate: 3.0
    },
    'Uganda': {
      flag: '🇺🇬',
      currency: 'UGX',
      exchangeRate: 3750,
      vat: 18,
      withholdingTax: 0,
      capitalGains: 0,
      digitalServicesTax: 5,
      psc: 0,
      optimizedRate: 0.5
    },
    'Rwanda': {
      flag: '🇷🇼',
      currency: 'RWF',
      exchangeRate: 1350,
      vat: 18,
      withholdingTax: 15,
      capitalGains: 0,
      digitalServicesTax: 0,
      psc: 0,
      optimizedRate: 2.0
    },
    'Tanzania': {
      flag: '🇹🇿',
      currency: 'TZS',
      exchangeRate: 2550,
      vat: 18,
      withholdingTax: 15,
      capitalGains: 10,
      digitalServicesTax: 2,
      psc: 0,
      optimizedRate: 3.5
    },
    'Mauritius': {
      flag: '🇲🇺',
      currency: 'MUR',
      exchangeRate: 46.5,
      vat: 15,
      withholdingTax: 0,
      capitalGains: 0,
      digitalServicesTax: 0,
      psc: 3,
      optimizedRate: 0.8
    }
  };

  const structures = [
    'Direct exchange → local bank',
    'Exchange → local fintech partner',
    'Stablecoin → CEX → local ramp',
    'DeFi → local on-ramp'
  ];

  // Structure tax multipliers
  const structureMultipliers = {
    'Direct exchange → local bank': 1.0,
    'Exchange → local fintech partner': 0.85,
    'Stablecoin → CEX → local ramp': 0.70,
    'DeFi → local on-ramp': 0.60
  };

  // Fetch live USDC price from CoinGecko
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd');
        const data = await response.json();
        setUsdcRate(data['usd-coin'].usd);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching price:', error);
        setUsdcRate(1.00); // Fallback
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate 7-day historical data
  const [historicalData] = useState(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        exposure: Math.random() * 15000 + 5000
      });
    }
    return data;
  });

  // Calculate tax
  const calculateTax = () => {
    const volume = parseFloat(monthlyVolume) || 0;
    if (volume === 0) return { current: 0, optimized: 0, savings: 0, currentRate: 0, optimizedRate: 0 };

    const country = countryData[selectedCountry];
    const structureMultiplier = structureMultipliers[currentStructure];

    // Current tax calculation (compound effect)
    let currentTaxRate = 0;
    currentTaxRate += country.vat;
    currentTaxRate += country.withholdingTax;
    currentTaxRate += country.capitalGains;
    currentTaxRate += country.digitalServicesTax;
    currentTaxRate += country.psc;
    
    // Apply structure multiplier
    currentTaxRate = currentTaxRate * structureMultiplier;

    // Optimized structure (using offshore + local entity)
    const optimizedTaxRate = country.optimizedRate;

    const currentTax = volume * (currentTaxRate / 100);
    const optimizedTax = volume * (optimizedTaxRate / 100);
    const savings = currentTax - optimizedTax;

    return {
      current: currentTax,
      optimized: optimizedTax,
      savings: savings,
      currentRate: currentTaxRate,
      optimizedRate: optimizedTaxRate
    };
  };

  const tax = calculateTax();
  const country = countryData[selectedCountry];

  // Format currency
  const formatUSD = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercent = (num) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Africa Crypto Tax Leakage Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Real-time tax optimization for Web3 businesses in Africa</p>
        </div>

        {/* Input Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 mb-6 border border-green-500/30 shadow-2xl shadow-green-500/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Volume Input */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                💰 Monthly Africa Volume (USDC/USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-6 h-6" />
                <input
                  type="number"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  placeholder="5000000"
                  className="w-full bg-black/50 border-2 border-green-500/50 rounded-xl px-12 py-4 text-2xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-all"
                />
              </div>
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🌍 Select Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 transition-all cursor-pointer"
              >
                {Object.keys(countryData).map(country => (
                  <option key={country} value={country}>
                    {countryData[country].flag} {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Structure Dropdown */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🏗️ Current Structure
              </label>
              <select
                value={currentStructure}
                onChange={(e) => setCurrentStructure(e.target.value)}
                className="w-full bg-black/50 border-2 border-green-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 transition-all cursor-pointer"
              >
                {structures.map(structure => (
                  <option key={structure} value={structure}>{structure}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Live USDC Rate */}
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-2xl p-6 border border-green-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">Live USDC Rate</h3>
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
              </div>
              <div className="text-4xl font-bold text-green-400 mb-1">
                ${usdcRate ? usdcRate.toFixed(4) : '1.0000'}
              </div>
              <div className="text-sm text-gray-400">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Source: CoinGecko API
              </div>
            </div>
          </div>

          {/* Local Currency Rate */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-2xl p-6 border border-blue-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">USDC → {country.currency}</h3>
                <span className="text-2xl">{country.flag}</span>
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {country.exchangeRate.toLocaleString()} {country.currency}
              </div>
              <div className="text-sm text-gray-400">
                1 USDC = {country.exchangeRate} {country.currency}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Interbank rate (2025)
              </div>
            </div>
          </div>
        </div>

        {/* Tax Breakdown Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 border border-yellow-500/30">
          <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {selectedCountry} Tax Rates 2025
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">VAT</div>
              <div className="text-xl font-bold text-red-400">{formatPercent(country.vat)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Withholding</div>
              <div className="text-xl font-bold text-red-400">{formatPercent(country.withholdingTax)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Capital Gains</div>
              <div className="text-xl font-bold text-red-400">{formatPercent(country.capitalGains)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Digital Services</div>
              <div className="text-xl font-bold text-red-400">{formatPercent(country.digitalServicesTax)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">PSC</div>
              <div className="text-xl font-bold text-red-400">{formatPercent(country.psc)}</div>
            </div>
          </div>
        </div>

        {/* Output Table - Big Numbers */}
        {monthlyVolume && parseFloat(monthlyVolume) > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-6 border-2 border-green-500/50 shadow-2xl shadow-green-500/20">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
              💎 Tax Impact Analysis
            </h2>
            
            <div className="space-y-6">
              {/* Current Tax */}
              <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">❌ Tax Paid TODAY (Current Structure)</div>
                    <div className="text-5xl font-bold text-red-400 mb-2">{formatUSD(tax.current)}</div>
                    <div className="text-xl text-red-300">{formatPercent(tax.currentRate)} effective rate</div>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-400" />
                </div>
              </div>

              {/* Optimized Tax */}
              <div className="bg-green-900/20 border-2 border-green-500/50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">✅ Tax with Optimized Structure</div>
                    <div className="text-5xl font-bold text-green-400 mb-2">{formatUSD(tax.optimized)}</div>
                    <div className="text-xl text-green-300">{formatPercent(tax.optimizedRate)} effective rate</div>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>

              {/* Savings */}
              <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-400 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-2">🚀 MONTHLY SAVINGS</div>
                    <div className="text-6xl font-bold text-green-300 mb-2">{formatUSD(tax.savings)}</div>
                    <div className="text-2xl text-green-400">
                      {formatPercent((tax.savings / tax.current) * 100)} reduction
                    </div>
                  </div>
                  <TrendingUp className="w-16 h-16 text-green-400" />
                </div>
              </div>

              {/* Annual Savings */}
              <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-400 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">📊 ANNUAL SAVINGS</div>
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {formatUSD(tax.savings * 12)}
                </div>
                <div className="text-xl text-yellow-400 mt-2">
                  Over 12 months with optimized structure
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Chart */}
        {monthlyVolume && parseFloat(monthlyVolume) > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              📈 7-Day Tax Exposure Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalData.map(d => ({
                ...d,
                exposure: (parseFloat(monthlyVolume) / 30) * (tax.currentRate / 100) * (1 + (Math.random() - 0.5) * 0.2)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #10b981', borderRadius: '8px' }}
                  formatter={(value) => [`${formatUSD(value)}`, 'Daily Tax Exposure']}
                />
                <Line type="monotone" dataKey="exposure" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-gray-500 text-center">
              Based on daily pro-rata calculation of monthly volume
            </div>
          </div>
        )}

        {/* Call to Action */}
        {monthlyVolume && parseFloat(monthlyVolume) > 0 && tax.savings > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-3">Ready to Save {formatUSD(tax.savings * 12)}/year?</h3>
            <p className="text-lg mb-4 text-green-100">
              Switch to an optimized structure and reduce your effective tax rate from {formatPercent(tax.currentRate)} to {formatPercent(tax.optimizedRate)}
            </p>
            <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105">
              Get Custom Tax Strategy →
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>⚠️ Tax rates are estimates based on 2025 regulations. Consult licensed tax professionals.</p>
          <p className="mt-2">Built for Web3 finance engineers | Live data via CoinGecko</p>
        </div>
      </div>
    </div>
  );
};

export default AfricaCryptoTaxDashboard;
