import React from 'react';
import { Handle, Position } from 'reactflow';
import { TrendingUp, TrendingDown, DollarSign, Home, Briefcase, Bitcoin, PieChart, Building2 } from 'lucide-react';

// Base widget wrapper component
const WidgetWrapper = ({ children, title, icon: Icon, color = 'blue', onRemove }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 min-w-[280px] hover:shadow-xl transition-shadow">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-2">
        {children}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
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
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Ticker</p>
          <p className="font-semibold">{data.ticker || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Shares</p>
          <p className="font-semibold">{data.shares?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p className="text-gray-500">Price</p>
          <p className="font-semibold">${data.price?.toFixed(2) || '0.00'}</p>
        </div>
        <div>
          <p className="text-gray-500">Value</p>
          <p className="font-semibold">${data.value?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="font-medium">{isPositive ? '+' : ''}{change}%</span>
        <span className="text-gray-500">Today</span>
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
  return (
    <WidgetWrapper
      title="Portfolio Summary"
      icon={PieChart}
      color="indigo"
      onRemove={data.onRemove}
    >
      <div className="space-y-3">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-indigo-600">
            ${data.totalValue?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Stocks</p>
            <p className="font-semibold">${data.stocks?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Bonds</p>
            <p className="font-semibold">${data.bonds?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Real Estate</p>
            <p className="font-semibold">${data.realEstate?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500">Other</p>
            <p className="font-semibold">${data.other?.toLocaleString() || '0'}</p>
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
