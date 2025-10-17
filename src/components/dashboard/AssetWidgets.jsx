import React from 'react';
import { Handle, Position } from 'reactflow';
import { TrendingUp, TrendingDown, DollarSign, Home, Briefcase, Bitcoin, PieChart, Building2 } from 'lucide-react';

// Color schemes for different widget types
const colorSchemes = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accentBg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  green: {
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    accentBg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    accentBg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  yellow: {
    gradient: 'from-yellow-400 to-orange-500',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    accentBg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  indigo: {
    gradient: 'from-indigo-500 to-purple-600',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    accentBg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    accentBg: 'bg-teal-50',
    border: 'border-teal-200',
  },
};

// Base widget wrapper component
const WidgetWrapper = ({ children, title, icon: Icon, color = 'blue', onRemove }) => {
  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-w-[320px] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-old-money-gold !border-2 !border-white"
      />

      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${scheme.gradient} p-4 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-5 rounded-full -ml-12 -mb-12"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg font-serif">{title}</h3>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500 transition-colors backdrop-blur-sm"
            >
              <span className="text-white text-lg font-bold">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>

      {/* Decorative bottom bar */}
      <div className={`h-1 bg-gradient-to-r ${scheme.gradient}`}></div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-old-money-gold !border-2 !border-white"
      />
    </div>
  );
};

// Stock Widget
export const StockWidget = ({ data }) => {
  const change = data.change || 0;
  const isPositive = change >= 0;

  return (
    <WidgetWrapper
      title={data.label || 'Stock Position'}
      icon={TrendingUp}
      color="blue"
      onRemove={data.onRemove}
    >
      {/* Ticker and Price */}
      <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-blue-600">{data.ticker || 'N/A'}</span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-800">${data.price?.toFixed(2) || '0.00'}</div>
        <div className="text-xs text-gray-500 mt-1">Per Share</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Shares Owned</p>
          <p className="text-lg font-bold text-gray-800">{data.shares?.toLocaleString() || '0'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Value</p>
          <p className="text-lg font-bold text-blue-600">${data.value?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Bond Widget
export const BondWidget = ({ data }) => {
  return (
    <WidgetWrapper
      title={data.label || 'Bond Position'}
      icon={DollarSign}
      color="green"
      onRemove={data.onRemove}
    >
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Issuer</p>
          <p className="font-semibold">{data.issuer || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Face Value</p>
          <p className="font-semibold">${data.faceValue?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p className="text-gray-500">Coupon Rate</p>
          <p className="font-semibold">{data.couponRate || '0'}%</p>
        </div>
        <div>
          <p className="text-gray-500">Maturity</p>
          <p className="font-semibold">{data.maturityDate || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Yield</p>
          <p className="font-semibold">{data.yield || '0'}%</p>
        </div>
        <div>
          <p className="text-gray-500">Market Value</p>
          <p className="font-semibold">${data.marketValue?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Real Estate Widget
export const RealEstateWidget = ({ data }) => {
  return (
    <WidgetWrapper
      title={data.label || 'Real Estate'}
      icon={Home}
      color="orange"
      onRemove={data.onRemove}
    >
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-500">Property</p>
          <p className="font-semibold">{data.propertyName || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Location</p>
          <p className="font-semibold">{data.location || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-500">Purchase Price</p>
            <p className="font-semibold">${data.purchasePrice?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Value</p>
            <p className="font-semibold">${data.currentValue?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Annual Income</p>
            <p className="font-semibold">${data.annualIncome?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">ROI</p>
            <p className="font-semibold text-green-600">{data.roi || '0'}%</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Private Equity Widget
export const PrivateEquityWidget = ({ data }) => {
  return (
    <WidgetWrapper
      title={data.label || 'Private Equity'}
      icon={Briefcase}
      color="purple"
      onRemove={data.onRemove}
    >
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-500">Fund Name</p>
          <p className="font-semibold">{data.fundName || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-500">Investment</p>
            <p className="font-semibold">${data.investment?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Value</p>
            <p className="font-semibold">${data.currentValue?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">IRR</p>
            <p className="font-semibold text-green-600">{data.irr || '0'}%</p>
          </div>
          <div>
            <p className="text-gray-500">Vintage</p>
            <p className="font-semibold">{data.vintage || 'N/A'}</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Crypto Widget
export const CryptoWidget = ({ data }) => {
  const change = data.change || 0;
  const isPositive = change >= 0;

  return (
    <WidgetWrapper
      title={data.label || 'Crypto Asset'}
      icon={Bitcoin}
      color="yellow"
      onRemove={data.onRemove}
    >
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Asset</p>
          <p className="font-semibold">{data.asset || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Amount</p>
          <p className="font-semibold">{data.amount?.toFixed(4) || '0'}</p>
        </div>
        <div>
          <p className="text-gray-500">Price</p>
          <p className="font-semibold">${data.price?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p className="text-gray-500">Value</p>
          <p className="font-semibold">${data.value?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="font-medium">{isPositive ? '+' : ''}{change}%</span>
        <span className="text-gray-500">24h</span>
      </div>
    </WidgetWrapper>
  );
};

// Portfolio Summary Widget
export const PortfolioSummaryWidget = ({ data }) => {
  const totalValue = data.totalValue || 0;
  const stocks = data.stocks || 0;
  const bonds = data.bonds || 0;
  const realEstate = data.realEstate || 0;
  const other = data.other || 0;

  const percentages = {
    stocks: totalValue ? ((stocks / totalValue) * 100).toFixed(1) : 0,
    bonds: totalValue ? ((bonds / totalValue) * 100).toFixed(1) : 0,
    realEstate: totalValue ? ((realEstate / totalValue) * 100).toFixed(1) : 0,
    other: totalValue ? ((other / totalValue) * 100).toFixed(1) : 0,
  };

  return (
    <WidgetWrapper
      title="Portfolio Summary"
      icon={PieChart}
      color="indigo"
      onRemove={data.onRemove}
    >
      {/* Total Value Card */}
      <div className="mb-4 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
        <p className="text-sm opacity-90 mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold">
          ${totalValue.toLocaleString()}
        </p>
      </div>

      {/* Allocation Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Stocks</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">${stocks.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{percentages.stocks}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Bonds</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">${bonds.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{percentages.bonds}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Real Estate</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">${realEstate.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{percentages.realEstate}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Other</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">${other.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{percentages.other}%</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Alternative Investment Widget
export const AlternativeWidget = ({ data }) => {
  return (
    <WidgetWrapper
      title={data.label || 'Alternative Investment'}
      icon={Building2}
      color="teal"
      onRemove={data.onRemove}
    >
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-500">Asset Type</p>
          <p className="font-semibold">{data.assetType || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Description</p>
          <p className="font-semibold">{data.description || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-500">Investment</p>
            <p className="font-semibold">${data.investment?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Value</p>
            <p className="font-semibold">${data.currentValue?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

// Widget type mapping
export const widgetTypes = {
  stock: StockWidget,
  bond: BondWidget,
  realEstate: RealEstateWidget,
  privateEquity: PrivateEquityWidget,
  crypto: CryptoWidget,
  portfolioSummary: PortfolioSummaryWidget,
  alternative: AlternativeWidget,
};
