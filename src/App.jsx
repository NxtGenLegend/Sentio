import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Users,
  UserCheck,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  StickyNote,
  DollarSign,
  Activity,
  Calendar,
  Target,
  BarChart3,
  LineChart,
  Newspaper,
  Bell,
  Filter,
  ExternalLink,
  Clock,
  Tag,
  Plus,
  X,
  ArrowRight
} from 'lucide-react';
import {
  getClients,
  getProspects,
  createProspect,
  createNewClient,
  convertProspectToClient,
  updateProspect,
  getPortfolioAllocations,
  getClientAccounts,
  getHoldings,
  getAlertConfig,
  updateAlertConfig,
  supabase
} from './lib/supabase';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Mock Data
const mockProspects = [
  {
    id: 1,
    name: 'Alexandra Pemberton',
    company: 'Pemberton Holdings',
    status: 'New',
    tags: ['Family Office', 'Real Estate'],
    notes: 'Third-generation wealth. Interested in sustainable investing and impact portfolios. Currently holds $45M in real estate across Manhattan and the Hamptons. Looking to diversify into private equity.',
    interactions: [
      { date: '2024-10-10', type: 'Call', note: 'Initial discovery call. Very impressed with our ESG offerings.' },
      { date: '2024-10-05', type: 'Email', note: 'Sent introduction package and fee schedule.' },
    ]
  },
  {
    id: 2,
    name: 'James Hartford III',
    company: 'Hartford Capital',
    status: 'Contacted',
    tags: ['Tech Founder', 'Exit Planning'],
    notes: 'Recently sold his fintech startup for $120M. Age 42, married with three children. Primary concerns: tax optimization, estate planning, and maintaining lifestyle post-exit.',
    interactions: [
      { date: '2024-10-12', type: 'Meeting', note: 'Met at the club. Discussed tax-loss harvesting strategies.' },
      { date: '2024-10-08', type: 'Call', note: 'Follow-up on estate planning documents.' },
      { date: '2024-10-01', type: 'Email', note: 'Referral from existing client Richard Ashford.' },
    ]
  },
  {
    id: 3,
    name: 'Victoria Ashford',
    company: 'Independent',
    status: 'Contacted',
    tags: ['Divorcee', 'Art Collector'],
    notes: 'High-net-worth individual going through divorce proceedings. Estimated settlement of $80M. Passionate about contemporary art. Needs guidance on asset protection and creating a new financial identity.',
    interactions: [
      { date: '2024-10-14', type: 'Meeting', note: 'Confidential meeting at our private office. Discussed asset protection trusts.' },
      { date: '2024-10-09', type: 'Call', note: 'Emotional support call. Building trust.' },
    ]
  },
  {
    id: 4,
    name: 'Dr. Marcus Chen',
    company: 'Chen Medical Group',
    status: 'New',
    tags: ['Medical Practice', 'Retirement Planning'],
    notes: 'Orthopedic surgeon, age 58, planning to sell practice in 3-5 years. Current net worth approximately $12M. Wife is an architect. Two children in college. Conservative investment philosophy.',
    interactions: [
      { date: '2024-10-13', type: 'Email', note: 'Sent retirement planning questionnaire.' },
    ]
  },
  {
    id: 5,
    name: 'Sophia Vanderbilt-Ross',
    company: 'Vanderbilt Trust',
    status: 'Warm',
    tags: ['Inherited Wealth', 'Philanthropy'],
    notes: 'Managing trustee of family trust worth $200M+. Age 35, interested in impact investing and establishing a private foundation. Yale graduate, board member of three major museums.',
    interactions: [
      { date: '2024-10-15', type: 'Meeting', note: 'Lunch at her club. Discussed family foundation structure.' },
      { date: '2024-10-11', type: 'Call', note: 'Introduction call facilitated by mutual friend.' },
      { date: '2024-10-07', type: 'Event', note: 'Met at charity gala. Natural connection.' },
    ]
  },
  {
    id: 6,
    name: 'Robert & Catherine Sterling',
    company: 'Sterling Enterprises',
    status: 'Contacted',
    tags: ['Business Owners', 'Succession Planning'],
    notes: 'Fourth-generation family business (manufacturing). Annual revenue $50M. Three adult children, only one interested in business. Need succession and liquidity planning. Combined net worth $85M.',
    interactions: [
      { date: '2024-10-14', type: 'Meeting', note: 'Business valuation discussion with both partners.' },
      { date: '2024-10-06', type: 'Call', note: 'Initial outreach. Referred by their attorney.' },
    ]
  },
];

const mockClients = [
  { id: 1, name: 'Richard & Margaret Ashford', aum: '$42,500,000', clientSince: '2019' },
  { id: 2, name: 'The Whitmore Family Trust', aum: '$78,200,000', clientSince: '2015' },
  { id: 3, name: 'Harrison Blackwell', aum: '$31,800,000', clientSince: '2021' },
  { id: 4, name: 'Eleanor Cunningham', aum: '$19,500,000', clientSince: '2020' },
  { id: 5, name: 'The Kensington Foundation', aum: '$125,000,000', clientSince: '2012' },
];

const mockNewsAlerts = [
  {
    id: 1,
    title: 'Manhattan Real Estate Prices Surge 12% in Q4',
    summary: 'Luxury real estate market in Manhattan sees significant gains, particularly in Upper East Side properties. High-net-worth buyers driving demand.',
    source: 'Wall Street Journal',
    url: 'https://wsj.com/real-estate',
    publishedAt: '2 hours ago',
    relevantClients: ['Richard & Margaret Ashford'],
    tags: ['Real Estate', 'Manhattan', 'Market Update'],
    priority: 'high',
    category: 'Market News'
  },
  {
    id: 2,
    title: 'New ESG Investment Guidelines Released by SEC',
    summary: 'SEC publishes updated guidelines for Environmental, Social, and Governance investment disclosures, impacting sustainable investment portfolios.',
    source: 'Financial Times',
    url: 'https://ft.com/esg-regulations',
    publishedAt: '5 hours ago',
    relevantClients: ['The Kensington Foundation', 'The Whitmore Family Trust'],
    tags: ['ESG', 'Regulation', 'Compliance'],
    priority: 'high',
    category: 'Regulatory'
  },
  {
    id: 3,
    title: 'Tech Sector Rally Continues: NASDAQ Up 3.2%',
    summary: 'Technology stocks surge on strong earnings reports from major players. AI and cloud computing sectors lead gains.',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/tech-rally',
    publishedAt: '1 day ago',
    relevantClients: ['Harrison Blackwell'],
    tags: ['Technology', 'NASDAQ', 'Equities'],
    priority: 'medium',
    category: 'Market News'
  },
  {
    id: 4,
    title: 'Federal Reserve Signals Potential Rate Cuts in 2025',
    summary: 'Fed Chair indicates willingness to adjust rates based on inflation data. Bond markets react positively to dovish commentary.',
    source: 'Reuters',
    url: 'https://reuters.com/fed-rates',
    publishedAt: '1 day ago',
    relevantClients: ['All Clients'],
    tags: ['Federal Reserve', 'Interest Rates', 'Fixed Income'],
    priority: 'high',
    category: 'Economic Policy'
  },
  {
    id: 5,
    title: 'Private Equity Deals Reach 5-Year High',
    summary: 'Private equity firms deploy record capital in Q4. Middle-market transactions particularly active in healthcare and technology sectors.',
    source: 'Private Equity International',
    url: 'https://pei.com/deals',
    publishedAt: '2 days ago',
    relevantClients: ['The Whitmore Family Trust', 'Richard & Margaret Ashford'],
    tags: ['Private Equity', 'Alternative Investments'],
    priority: 'medium',
    category: 'Market News'
  },
  {
    id: 6,
    title: 'Art Market Shows Resilience Despite Economic Headwinds',
    summary: 'Contemporary art auctions exceed expectations. Blue-chip artists command premium prices at Sotheby\'s and Christie\'s.',
    source: 'Art News',
    url: 'https://artnews.com/market',
    publishedAt: '3 days ago',
    relevantClients: ['Eleanor Cunningham'],
    tags: ['Art Market', 'Alternative Assets'],
    priority: 'low',
    category: 'Alternative Investments'
  },
  {
    id: 7,
    title: 'New Estate Tax Proposals in Congress',
    summary: 'Bipartisan legislation proposes changes to estate tax exemptions. High-net-worth families should review estate plans.',
    source: 'Tax Notes',
    url: 'https://taxnotes.com/estate',
    publishedAt: '3 days ago',
    relevantClients: ['All Clients'],
    tags: ['Estate Planning', 'Tax Law', 'Compliance'],
    priority: 'high',
    category: 'Regulatory'
  },
  {
    id: 8,
    title: 'Sustainable Investing Flows Hit Record $120B',
    summary: 'ESG-focused funds see unprecedented inflows as institutional investors prioritize sustainability criteria.',
    source: 'Morningstar',
    url: 'https://morningstar.com/esg-flows',
    publishedAt: '4 days ago',
    relevantClients: ['The Kensington Foundation', 'The Whitmore Family Trust'],
    tags: ['ESG', 'Sustainable Investing', 'Fund Flows'],
    priority: 'medium',
    category: 'Investment Trends'
  }
];

// Custom Node Components for React Flow with Animations
const PortfolioAllocationNode = ({ data, selected }) => {
  const allocations = data.allocations || [
    { label: 'Equities', value: 60, color: '#C4A574' },
    { label: 'Fixed Income', value: 30, color: '#8B7355' },
    { label: 'Cash & Equivalents', value: 10, color: '#D4AF37' },
  ];

  const total = allocations.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream to-white border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 340 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-4 flex items-center">
        <PieChart className="w-6 h-6 mr-2 animate-pulse" />
        Portfolio Allocation
      </div>

      {/* Animated Donut Chart */}
      <div className="flex justify-center mb-5">
        <svg width="160" height="160" viewBox="0 0 160 160" className="filter drop-shadow-lg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="80" cy="80" r="65" fill="none" stroke="#F5F1E8" strokeWidth="22" />
          {allocations.map((item, index) => {
            const startPercent = cumulativePercent;
            cumulativePercent += (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = (startPercent / 100) * 360 - 90;
            const endAngle = startAngle + angle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = 80 + 65 * Math.cos(startRad);
            const y1 = 80 + 65 * Math.sin(startRad);
            const x2 = 80 + 65 * Math.cos(endRad);
            const y2 = 80 + 65 * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 80 80 L ${x1} ${y1} A 65 65 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
                opacity={hoveredIndex === index ? "1" : "0.85"}
                className="transition-all duration-300 cursor-pointer"
                filter={hoveredIndex === index ? "url(#glow)" : ""}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                }}
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to={hoveredIndex === index ? "1" : "0.85"}
                  dur="0.8s"
                  begin="0s"
                  fill="freeze"
                />
              </path>
            );
          })}
          <circle cx="80" cy="80" r="45" fill="#F5F1E8" />
          <text x="80" y="85" textAnchor="middle" className="fill-old-money-navy font-serif font-bold text-xl">
            100%
          </text>
        </svg>
      </div>

      {/* Animated Legend */}
      <div className="space-y-2">
        {allocations.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between text-sm p-2 rounded-lg transition-all duration-200 ${
              hoveredIndex === index ? 'bg-old-money-navy/5 scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3 transition-transform duration-200"
                style={{
                  backgroundColor: item.color,
                  transform: hoveredIndex === index ? 'scale(1.2)' : 'scale(1)'
                }}
              />
              <span className="text-old-money-navy font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-old-money-navy">{item.value}%</span>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const NetWorthNode = ({ data, selected }) => {
  const netWorth = data.netWorth || 8750000;
  const change = data.change || 425000;
  const changePercent = ((change / netWorth) * 100).toFixed(1);
  const isPositive = change >= 0;

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = netWorth;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [netWorth]);

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream via-white to-old-money-cream/80 border-2 rounded-xl p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 320 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-6 flex items-center">
        <div className="p-2 bg-old-money-navy/10 rounded-lg mr-3">
          <TrendingUp className="w-6 h-6 animate-bounce" />
        </div>
        Net Worth
      </div>

      <div className="text-5xl font-serif font-bold text-old-money-navy mb-3 tracking-tight">
        ${(displayValue / 1000000).toFixed(2)}M
      </div>

      <div className={`flex items-center text-sm px-3 py-2 rounded-lg ${
        isPositive ? 'bg-green-50' : 'bg-red-50'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-2 text-green-700" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-2 text-red-700" />
        )}
        <span className={`font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
          {isPositive ? '+' : ''}${(Math.abs(change) / 1000).toFixed(0)}K ({changePercent}%)
        </span>
        <span className="text-old-money-navy/60 ml-2">this quarter</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const PerformanceChartNode = ({ data, selected }) => {
  const performanceData = data.performance || [
    { month: 'Jan', value: 7.2 },
    { month: 'Feb', value: 7.5 },
    { month: 'Mar', value: 7.8 },
    { month: 'Apr', value: 8.0 },
    { month: 'May', value: 8.3 },
    { month: 'Jun', value: 8.75 },
  ];

  const maxValue = Math.max(...performanceData.map(d => d.value));
  const minValue = Math.min(...performanceData.map(d => d.value));

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream to-white border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 400 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <LineChart className="w-6 h-6 mr-2" />
          Performance
        </div>
        <span className="text-sm font-normal text-green-700 bg-green-50 px-3 py-1 rounded-full">
          +21.5% YTD
        </span>
      </div>

      <div className="mb-4">
        <svg width="100%" height="140" viewBox="0 0 360 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C4A574" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C4A574" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C4A574" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * 35}
              x2="360"
              y2={i * 35}
              stroke="#0A1929"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          ))}

          {/* Area under line */}
          <path
            d={`M 0 ${140 - ((performanceData[0].value - minValue) / (maxValue - minValue)) * 120} ${performanceData.map((d, i) =>
              `L ${(i * 360) / (performanceData.length - 1)} ${140 - ((d.value - minValue) / (maxValue - minValue)) * 120}`
            ).join(' ')} L 360 140 L 0 140 Z`}
            fill="url(#areaGradient)"
          >
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="1s"
              fill="freeze"
            />
          </path>

          {/* Line */}
          <path
            d={`M 0 ${140 - ((performanceData[0].value - minValue) / (maxValue - minValue)) * 120} ${performanceData.map((d, i) =>
              `L ${(i * 360) / (performanceData.length - 1)} ${140 - ((d.value - minValue) / (maxValue - minValue)) * 120}`
            ).join(' ')}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="stroke-dasharray"
              from="0 1000"
              to="1000 0"
              dur="2s"
              fill="freeze"
            />
          </path>

          {/* Data points */}
          {performanceData.map((d, i) => (
            <circle
              key={i}
              cx={(i * 360) / (performanceData.length - 1)}
              cy={140 - ((d.value - minValue) / (maxValue - minValue)) * 120}
              r="4"
              fill="#C4A574"
              stroke="#fff"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <animate
                attributeName="r"
                from="0"
                to="4"
                dur="0.5s"
                begin={`${i * 0.1}s`}
                fill="freeze"
              />
            </circle>
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-old-money-navy/60 px-1">
        {performanceData.map((d, i) => (
          <span key={i} className="font-medium">{d.month}</span>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const GoalsNode = ({ data, selected }) => {
  const goals = data.goals || [
    { name: 'Retirement Fund', current: 6200000, target: 10000000, color: '#C4A574' },
    { name: 'Education Fund', current: 480000, target: 500000, color: '#8B7355' },
    { name: 'Estate Planning', current: 2100000, target: 3000000, color: '#D4AF37' },
  ];

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream to-white border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 360 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-4 flex items-center">
        <Target className="w-6 h-6 mr-2" />
        Financial Goals
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const percentage = (goal.current / goal.target) * 100;
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-old-money-navy">{goal.name}</span>
                <span className="text-xs text-old-money-navy/60">
                  ${(goal.current / 1000000).toFixed(2)}M / ${(goal.target / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="h-3 bg-old-money-navy/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-90"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: goal.color,
                  }}
                >
                  <animate
                    attributeName="width"
                    from="0%"
                    to={`${percentage}%`}
                    dur="1.5s"
                    fill="freeze"
                  />
                </div>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs font-bold text-old-money-navy">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const NotesNode = ({ data, selected }) => {
  const [note, setNote] = useState(data.note || '');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 to-yellow-50 border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl ${
        selected || isFocused ? 'border-old-money-navy ring-4 ring-old-money-navy/20 scale-105' : 'border-old-money-navy/40'
      }`}
      style={{ width: 340 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-3 flex items-center">
        <StickyNote className="w-6 h-6 mr-2" />
        Client Notes
      </div>

      <textarea
        className="w-full h-40 p-4 border-2 border-old-money-navy/20 rounded-lg bg-white/80 text-old-money-navy text-sm resize-none focus:outline-none focus:border-old-money-navy focus:bg-white transition-all duration-200 font-sans"
        placeholder="Add important notes about this client..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const UpcomingMeetingsNode = ({ data, selected }) => {
  const meetings = data.meetings || [
    { date: 'Oct 28', time: '2:00 PM', title: 'Quarterly Review', type: 'In-Person' },
    { date: 'Nov 5', time: '10:30 AM', title: 'Tax Planning', type: 'Video Call' },
    { date: 'Nov 15', time: '3:00 PM', title: 'Portfolio Rebalance', type: 'Phone' },
  ];

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream to-white border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 320 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-4 flex items-center">
        <Calendar className="w-6 h-6 mr-2" />
        Upcoming Meetings
      </div>

      <div className="space-y-3">
        {meetings.map((meeting, index) => (
          <div
            key={index}
            className="p-3 bg-white rounded-lg border border-old-money-navy/20 hover:border-old-money-navy/40 transition-all duration-200 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-old-money-navy text-sm mb-1 group-hover:text-old-money-navy/80 transition-colors">
                  {meeting.title}
                </div>
                <div className="text-xs text-old-money-navy/60">
                  {meeting.date} at {meeting.time}
                </div>
              </div>
              <span className="text-xs bg-old-money-navy/10 text-old-money-navy px-2 py-1 rounded-full">
                {meeting.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const NewsAlertsNode = ({ data, selected }) => {
  const clientName = data.clientName || 'The Whitmore Family Trust';

  // Filter news alerts specific to this client
  const clientNews = mockNewsAlerts.filter(news =>
    news.relevantClients.includes(clientName) ||
    news.relevantClients.includes('All Clients')
  ).slice(0, 3); // Show only top 3 most recent

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-old-money-cream to-white border-2 rounded-xl p-5 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 ${
        selected ? 'border-old-money-navy ring-4 ring-old-money-navy/20' : 'border-old-money-navy/40'
      }`}
      style={{ width: 420 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />

      <div className="font-serif text-old-money-navy text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Newspaper className="w-6 h-6 mr-2" />
          Relevant News
        </div>
        {clientNews.length > 0 && (
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
            {clientNews.length} new
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {clientNews.length === 0 ? (
          <div className="text-center py-6 text-old-money-navy/60 text-sm">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No recent news alerts
          </div>
        ) : (
          clientNews.map((news, index) => (
            <div
              key={news.id}
              className="p-3 bg-white rounded-lg border border-old-money-navy/20 hover:border-old-money-navy/40 transition-all duration-200 hover:shadow-md group cursor-pointer"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getPriorityColor(news.priority)}`}>
                  {news.priority.toUpperCase()}
                </span>
                <span className="text-xs text-old-money-navy/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {news.publishedAt}
                </span>
              </div>

              <h4 className="font-semibold text-old-money-navy text-sm mb-1 group-hover:text-old-money-navy/80 transition-colors line-clamp-2">
                {news.title}
              </h4>

              <p className="text-xs text-old-money-navy/70 mb-2 line-clamp-2">
                {news.summary}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-old-money-navy/60">
                  {news.source}
                </span>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-old-money-navy hover:text-old-money-navy/70 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {clientNews.length > 0 && (
        <button className="w-full mt-3 py-2 bg-old-money-navy/5 hover:bg-old-money-navy/10 text-old-money-navy text-sm font-semibold rounded-lg transition-all duration-200">
          View All News Alerts
        </button>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

const nodeTypes = {
  portfolioAllocation: PortfolioAllocationNode,
  netWorth: NetWorthNode,
  performance: PerformanceChartNode,
  goals: GoalsNode,
  notes: NotesNode,
  meetings: UpcomingMeetingsNode,
  newsAlerts: NewsAlertsNode,
};

// Main App Component
function App() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('prospects');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [advisorProfile, setAdvisorProfile] = useState({
    name: 'Penelope Whitmore',
    email: 'p.whitmore@sentio.com',
    password: '••••••••'
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Supabase data state
  const [clients, setClients] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateProspectModal, setShowCreateProspectModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showConvertToClientModal, setShowConvertToClientModal] = useState(false);
  const [prospectToConvert, setProspectToConvert] = useState(null);

  // Load data from Supabase (only when authenticated)
  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [clientsData, prospectsData] = await Promise.all([
          getClients(),
          getProspects()
        ]);

        setClients(clientsData || []);
        setProspects(prospectsData || []);

        // Set first prospect as selected if available
        if (prospectsData && prospectsData.length > 0) {
          setSelectedProspect(prospectsData[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data if Supabase fails
        setClients(mockClients);
        setProspects(mockProspects);
        setSelectedProspect(mockProspects[0]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // React Flow state
  const initialNodes = [
    {
      id: '1',
      type: 'netWorth',
      position: { x: 50, y: 50 },
      data: {},
    },
    {
      id: '2',
      type: 'performance',
      position: { x: 420, y: 50 },
      data: {},
    },
    {
      id: '3',
      type: 'portfolioAllocation',
      position: { x: 870, y: 50 },
      data: {},
    },
    {
      id: '4',
      type: 'goals',
      position: { x: 50, y: 400 },
      data: {},
    },
    {
      id: '5',
      type: 'meetings',
      position: { x: 460, y: 400 },
      data: {},
    },
    {
      id: '6',
      type: 'notes',
      position: { x: 830, y: 400 },
      data: { note: 'Client Profile:\n• Risk Tolerance: Moderate-Conservative\n• Investment Horizon: 15-20 years\n• Primary Goals: Retirement, Education Fund\n• Prefers: ESG investments, quarterly reviews\n\nNext Review: November 15, 2024' },
    },
    {
      id: '7',
      type: 'newsAlerts',
      position: { x: 50, y: 750 },
      data: { clientName: 'The Whitmore Family Trust' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // State for news filters
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNewsClient, setSelectedNewsClient] = useState('all');
  const [isFetchingNews, setIsFetchingNews] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'prospects', label: 'Prospects', icon: Users },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    { id: 'news', label: 'News Alerts', icon: Newspaper },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Login/Signup handlers
  const handleLogin = (email, password) => {
    // For now, accept any credentials
    setIsAuthenticated(true);
    setAdvisorProfile({
      ...advisorProfile,
      email: email,
      name: email.split('@')[0] // Use email username as name for now
    });
  };

  const handleSignup = (name, email, password) => {
    // For now, accept any credentials
    setIsAuthenticated(true);
    setAdvisorProfile({
      ...advisorProfile,
      name: name,
      email: email
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdvisorProfile({
      name: '',
      email: '',
      password: ''
    });
  };

  // Modal Components
  const CreateProspectModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      estimated_aum: '',
      notes: '',
      tags: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await createProspect({
          advisor_id: '00000000-0000-0000-0000-000000000001',
          ...formData,
          estimated_aum: formData.estimated_aum ? parseFloat(formData.estimated_aum) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          first_contact_date: new Date().toISOString().split('T')[0]
        });

        // Reload prospects
        const prospectsData = await getProspects();
        setProspects(prospectsData || []);

        // Close modal and reset
        setShowCreateProspectModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'new',
          estimated_aum: '',
          notes: '',
          tags: ''
        });
      } catch (error) {
        console.error('Error creating prospect:', error);
        alert('Failed to create prospect');
      }
    };

    if (!showCreateProspectModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-old-money-cream rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-old-money-navy">
              Add New Prospect
            </h2>
            <button
              onClick={() => setShowCreateProspectModal(false)}
              className="text-old-money-navy/60 hover:text-old-money-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Estimated AUM
                </label>
                <input
                  type="number"
                  value={formData.estimated_aum}
                  onChange={(e) => setFormData({ ...formData, estimated_aum: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                placeholder="e.g. Family Office, Real Estate"
              />
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateProspectModal(false)}
                className="flex-1 py-3 border-2 border-old-money-navy/20 text-old-money-navy rounded-lg font-semibold hover:bg-old-money-navy/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-old-money-navy text-old-money-cream rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors shadow-lg"
              >
                Create Prospect
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateClientModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      aum: '',
      client_since: new Date().toISOString().split('T')[0],
      account_type: 'individual',
      notes: '',
      tags: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await createNewClient({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          aum: formData.aum ? parseFloat(formData.aum) : 0,
          client_since: formData.client_since,
          account_type: formData.account_type,
          profile: {
            holdings: [],
            interests: [],
            riskTolerance: 'moderate',
            investmentStyle: 'balanced',
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
          },
          notes: formData.notes
        });

        // Reload clients
        const clientsData = await getClients();
        setClients(clientsData || []);

        // Close modal and reset
        setShowCreateClientModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          aum: '',
          client_since: new Date().toISOString().split('T')[0],
          account_type: 'individual',
          notes: '',
          tags: ''
        });
      } catch (error) {
        console.error('Error creating client:', error);
        alert('Failed to create client');
      }
    };

    if (!showCreateClientModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-old-money-cream rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-old-money-navy">
              Add New Client
            </h2>
            <button
              onClick={() => setShowCreateClientModal(false)}
              className="text-old-money-navy/60 hover:text-old-money-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Assets Under Management
                </label>
                <input
                  type="number"
                  value={formData.aum}
                  onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Client Since
                </label>
                <input
                  type="date"
                  value={formData.client_since}
                  onChange={(e) => setFormData({ ...formData, client_since: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Account Type
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                >
                  <option value="individual">Individual</option>
                  <option value="joint">Joint</option>
                  <option value="trust">Trust</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                placeholder="e.g. High Net Worth, Retired"
              />
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateClientModal(false)}
                className="flex-1 py-3 border-2 border-old-money-navy/20 text-old-money-navy rounded-lg font-semibold hover:bg-old-money-navy/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-old-money-navy text-old-money-cream rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors shadow-lg"
              >
                Create Client
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ConvertToClientModal = () => {
    const [formData, setFormData] = useState({
      aum: '',
      client_since: new Date().toISOString().split('T')[0],
      account_type: 'individual'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!prospectToConvert) return;

      try {
        await convertProspectToClient(prospectToConvert.id, {
          aum: formData.aum ? parseFloat(formData.aum) : 0,
          client_since: formData.client_since,
          account_type: formData.account_type
        });

        // Reload both prospects and clients
        const [prospectsData, clientsData] = await Promise.all([
          getProspects(),
          getClients()
        ]);
        setProspects(prospectsData || []);
        setClients(clientsData || []);

        // Clear selected prospect if it was the one converted
        if (selectedProspect?.id === prospectToConvert.id) {
          setSelectedProspect(prospectsData && prospectsData.length > 0 ? prospectsData[0] : null);
        }

        // Close modal and reset
        setShowConvertToClientModal(false);
        setProspectToConvert(null);
        setFormData({
          aum: '',
          client_since: new Date().toISOString().split('T')[0],
          account_type: 'individual'
        });
      } catch (error) {
        console.error('Error converting prospect to client:', error);
        alert('Failed to convert prospect to client');
      }
    };

    if (!showConvertToClientModal || !prospectToConvert) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-old-money-cream rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-old-money-navy">
              Convert to Client
            </h2>
            <button
              onClick={() => {
                setShowConvertToClientModal(false);
                setProspectToConvert(null);
              }}
              className="text-old-money-navy/60 hover:text-old-money-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Converting:</strong> {prospectToConvert.name}
              <br />
              This will move {prospectToConvert.name} from prospects to clients.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Initial Assets Under Management *
              </label>
              <input
                type="number"
                value={formData.aum}
                onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Client Since
              </label>
              <input
                type="date"
                value={formData.client_since}
                onChange={(e) => setFormData({ ...formData, client_since: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
              />
            </div>

            <div>
              <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                Account Type
              </label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-4 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
              >
                <option value="individual">Individual</option>
                <option value="joint">Joint</option>
                <option value="trust">Trust</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowConvertToClientModal(false);
                  setProspectToConvert(null);
                }}
                className="flex-1 py-3 border-2 border-old-money-navy/20 text-old-money-navy rounded-lg font-semibold hover:bg-old-money-navy/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-old-money-navy text-old-money-cream rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Convert to Client
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Login/Signup Page Component
  const LoginPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (showSignup) {
        handleSignup(formData.name, formData.email, formData.password);
      } else {
        handleLogin(formData.email, formData.password);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-old-money-navy via-old-money-navy/95 to-old-money-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl font-bold text-old-money-cream mb-2">
              Sentio
            </h1>
            <p className="text-old-money-cream/60 text-sm">
              Wealth Management Platform
            </p>
          </div>

          {/* Login/Signup Card */}
          <div className="bg-old-money-cream rounded-2xl shadow-2xl p-8 border border-old-money-navy/20">
            <h2 className="font-serif text-2xl font-bold text-old-money-navy mb-6 text-center">
              {showSignup ? 'Create Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {showSignup && (
                <div>
                  <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                    placeholder="Penelope Whitmore"
                    required={showSignup}
                  />
                </div>
              )}

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-old-money-navy font-semibold mb-2 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy transition-colors bg-white text-old-money-navy"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-old-money-navy text-old-money-cream py-3 rounded-lg font-semibold hover:bg-old-money-navy/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {showSignup ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowSignup(!showSignup);
                  setFormData({ name: '', email: '', password: '' });
                }}
                className="text-old-money-navy/70 hover:text-old-money-navy transition-colors text-sm"
              >
                {showSignup ? (
                  <>
                    Already have an account? <span className="font-semibold">Sign In</span>
                  </>
                ) : (
                  <>
                    Don't have an account? <span className="font-semibold">Sign Up</span>
                  </>
                )}
              </button>
            </div>

            {/* Temporary Notice */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 text-center">
                <strong>Demo Mode:</strong> Any email and password will work for now
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Page Components
  const ProspectDetailView = () => {
    const [isEditingProspect, setIsEditingProspect] = useState(false);
    const [editedProspect, setEditedProspect] = useState(null);

    useEffect(() => {
      if (selectedProspect) {
        setEditedProspect({ ...selectedProspect });
      }
    }, [selectedProspect]);

    if (!selectedProspect) {
      return (
        <div className="flex-1 flex h-full items-center justify-center">
          <div className="text-center text-old-money-navy/60">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p>Select a prospect to view details</p>
          </div>
        </div>
      );
    }

    if (!editedProspect) return null;

    const handleSaveProspect = async () => {
      try {
        const { data, error } = await supabase
          .from('prospects')
          .update(editedProspect)
          .eq('id', editedProspect.id)
          .select()
          .single();

        if (error) throw error;

        const updatedProspects = prospects.map(p => p.id === data.id ? data : p);
        setProspects(updatedProspects);
        setSelectedProspect(data);
        setEditedProspect(data);
        setIsEditingProspect(false);
      } catch (error) {
        console.error('Error updating prospect:', error);
        alert('Failed to update prospect');
      }
    };

    const handleCancelProspect = () => {
      setEditedProspect({ ...selectedProspect });
      setIsEditingProspect(false);
    };

    const prospect = isEditingProspect ? editedProspect : selectedProspect;

    const EditableProspectField = ({ label, value, field, type = 'text', options = null }) => {
      if (!isEditingProspect) {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60">{label}</label>
            <p className="text-old-money-navy">{value || 'Not provided'}</p>
          </div>
        );
      }

      if (type === 'select') {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
            <select
              value={editedProspect[field] || ''}
              onChange={(e) => setEditedProspect({ ...editedProspect, [field]: e.target.value })}
              className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy"
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      }

      if (type === 'textarea') {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
            <textarea
              value={editedProspect[field] || ''}
              onChange={(e) => setEditedProspect({ ...editedProspect, [field]: e.target.value })}
              className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy resize-none"
              rows="4"
            />
          </div>
        );
      }

      return (
        <div>
          <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
          <input
            type={type}
            value={editedProspect[field] || ''}
            onChange={(e) => setEditedProspect({ ...editedProspect, [field]: e.target.value })}
            className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy"
          />
        </div>
      );
    };

    return (
      <div className="flex-1 overflow-y-auto bg-old-money-cream/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-old-money-navy to-old-money-navy/90 p-6 border-b-4 border-old-money-navy shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-old-money-cream mb-2">
                {prospect.name}
              </h2>
              <p className="text-old-money-cream/80">
                {prospect.company || 'No company'} • {prospect.status || 'new'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setProspectToConvert(selectedProspect);
                  setShowConvertToClientModal(true);
                }}
                className="px-4 py-2 bg-old-money-cream/20 text-old-money-cream border border-old-money-cream/30 rounded-lg hover:bg-old-money-cream/30 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-semibold">Convert to Client</span>
              </button>
              {!isEditingProspect ? (
                <button
                  onClick={() => setIsEditingProspect(true)}
                  className="px-4 py-2 bg-old-money-cream text-old-money-navy rounded-lg hover:bg-old-money-cream/90 transition-all duration-200 font-semibold"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelProspect}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProspect}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 space-y-6">
          {/* Notes Widget - AT THE TOP as requested */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Notes & Additional Information
            </h2>
            <EditableProspectField label="Notes" value={prospect.notes} field="notes" type="textarea" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information Widget - Always show */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
              <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <EditableProspectField label="Name" value={prospect.name} field="name" />
                {(prospect.primary_email || isEditingProspect) && (
                  <EditableProspectField label="Primary Email" value={prospect.primary_email} field="primary_email" type="email" />
                )}
                {(prospect.secondary_email || isEditingProspect) && (
                  <EditableProspectField label="Secondary Email" value={prospect.secondary_email} field="secondary_email" type="email" />
                )}
                {(prospect.mobile_phone || isEditingProspect) && (
                  <EditableProspectField label="Mobile Phone" value={prospect.mobile_phone} field="mobile_phone" type="tel" />
                )}
                {(prospect.work_phone || isEditingProspect) && (
                  <EditableProspectField label="Work Phone" value={prospect.work_phone} field="work_phone" type="tel" />
                )}
                {(prospect.home_phone || isEditingProspect) && (
                  <EditableProspectField label="Home Phone" value={prospect.home_phone} field="home_phone" type="tel" />
                )}
                {(prospect.company || isEditingProspect) && (
                  <EditableProspectField label="Company" value={prospect.company} field="company" />
                )}
              </div>
            </div>

            {/* Status & Profile Widget - Always show */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
              <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Status & Profile
              </h2>
              <div className="space-y-3">
                <EditableProspectField
                  label="Status"
                  value={prospect.status}
                  field="status"
                  type="select"
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'warm', label: 'Warm' },
                    { value: 'cold', label: 'Cold' }
                  ]}
                />
                {(prospect.estimated_aum || isEditingProspect) && (
                  <EditableProspectField label="Estimated AUM" value={prospect.estimated_aum} field="estimated_aum" type="number" />
                )}
                {prospect.tags && prospect.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-old-money-navy/60 block mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {prospect.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-old-money-navy/10 text-old-money-navy rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information - Only show if any field has data */}
            {(prospect.date_of_birth || prospect.place_of_birth || prospect.ssn || prospect.mothers_maiden_name || isEditingProspect) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Personal Information
                </h2>
                <div className="space-y-3">
                  {(prospect.date_of_birth || isEditingProspect) && (
                    <EditableProspectField label="Date of Birth" value={prospect.date_of_birth} field="date_of_birth" type="date" />
                  )}
                  {(prospect.place_of_birth || isEditingProspect) && (
                    <EditableProspectField label="Place of Birth" value={prospect.place_of_birth} field="place_of_birth" />
                  )}
                  {(prospect.ssn || isEditingProspect) && (
                    <EditableProspectField label="SSN" value={prospect.ssn} field="ssn" />
                  )}
                  {(prospect.mothers_maiden_name || isEditingProspect) && (
                    <EditableProspectField label="Mother's Maiden Name" value={prospect.mothers_maiden_name} field="mothers_maiden_name" />
                  )}
                </div>
              </div>
            )}

            {/* Address Information - Only show if any address field has data */}
            {(prospect.legal_street || prospect.mailing_street || isEditingProspect) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Address Information
                </h2>
                <div className="space-y-4">
                  {(prospect.legal_street || isEditingProspect) && (
                    <div>
                      <h3 className="text-sm font-bold text-old-money-navy/80 mb-2">Legal Address</h3>
                      <div className="space-y-2">
                        <EditableProspectField label="Street" value={prospect.legal_street} field="legal_street" />
                        <div className="grid grid-cols-3 gap-2">
                          <EditableProspectField label="City" value={prospect.legal_city} field="legal_city" />
                          <EditableProspectField label="State" value={prospect.legal_state} field="legal_state" />
                          <EditableProspectField label="ZIP" value={prospect.legal_zip} field="legal_zip" />
                        </div>
                      </div>
                    </div>
                  )}
                  {(prospect.mailing_street || isEditingProspect) && (
                    <div>
                      <h3 className="text-sm font-bold text-old-money-navy/80 mb-2">Mailing Address</h3>
                      <div className="space-y-2">
                        <EditableProspectField label="Street" value={prospect.mailing_street} field="mailing_street" />
                        <div className="grid grid-cols-3 gap-2">
                          <EditableProspectField label="City" value={prospect.mailing_city} field="mailing_city" />
                          <EditableProspectField label="State" value={prospect.mailing_state} field="mailing_state" />
                          <EditableProspectField label="ZIP" value={prospect.mailing_zip} field="mailing_zip" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employment Information - Only show if any field has data */}
            {(prospect.employment_status || prospect.employer_name || prospect.occupation || isEditingProspect) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Employment Information
                </h2>
                <div className="space-y-3">
                  <EditableProspectField
                    label="Employment Status"
                    value={prospect.employment_status}
                    field="employment_status"
                    type="select"
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'employed', label: 'Employed' },
                      { value: 'not_employed', label: 'Not Employed' },
                      { value: 'retired', label: 'Retired' }
                    ]}
                  />
                  {(prospect.employer_name || isEditingProspect) && (
                    <EditableProspectField label="Employer" value={prospect.employer_name} field="employer_name" />
                  )}
                  {(prospect.occupation || isEditingProspect) && (
                    <EditableProspectField label="Occupation" value={prospect.occupation} field="occupation" />
                  )}
                  {(prospect.education_level || isEditingProspect) && (
                    <EditableProspectField
                      label="Education Level"
                      value={prospect.education_level}
                      field="education_level"
                      type="select"
                      options={[
                        { value: '', label: 'Select...' },
                        { value: 'High School', label: 'High School' },
                        { value: 'Bachelor', label: "Bachelor's" },
                        { value: 'Master', label: "Master's" },
                        { value: 'MBA', label: 'MBA' },
                        { value: 'PhD', label: 'PhD' }
                      ]}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Interaction History Widget */}
            {prospect.interactions && prospect.interactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20 lg:col-span-2">
                <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Interaction History
                </h2>
                <div className="space-y-4">
                  {prospect.interactions.map((interaction, index) => (
                    <div key={index} className="border-l-4 border-old-money-navy/30 pl-4 py-2 bg-old-money-cream/20 rounded-r-lg">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-old-money-navy">{interaction.type}</span>
                        <span className="text-sm text-old-money-navy/60">{interaction.date}</span>
                      </div>
                      <p className="text-old-money-navy/80 text-sm">{interaction.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProspectsPage = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-old-money-navy text-lg">Loading prospects...</div>
        </div>
      );
    }

    if (!selectedProspect && prospects.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-old-money-navy/40" />
            <p className="text-old-money-navy/60 text-lg">No prospects found</p>
            <p className="text-old-money-navy/40 text-sm mt-2">Add prospects in Supabase to get started</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full">
        {/* Left Column - Prospect List */}
        <div className="w-80 border-r border-old-money-navy/20 bg-old-money-cream/30 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold text-old-money-navy">
                Pipeline
              </h3>
              <button
                onClick={() => setShowCreateProspectModal(true)}
                className="p-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 hover:scale-105"
                title="Add New Prospect"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {prospects.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => setSelectedProspect(prospect)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                    selectedProspect?.id === prospect.id
                      ? 'bg-old-money-navy text-old-money-cream shadow-lg scale-102'
                      : 'bg-white hover:bg-old-money-navy/10 text-old-money-navy hover:shadow-md'
                  }`}
                >
                  <div className="font-semibold">{prospect.name}</div>
                  <div className={`text-sm ${
                    selectedProspect?.id === prospect.id
                      ? 'text-old-money-cream/80'
                      : 'text-old-money-navy/60'
                  }`}>
                    {prospect.company || 'No company'}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      prospect.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : prospect.status === 'contacted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : prospect.status === 'warm'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prospect.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Right Column - Prospect Details */}
      <ProspectDetailView />
    </div>
    );
  };


  const ClientsPage = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-old-money-navy text-lg">Loading clients...</div>
        </div>
      );
    }

    // Calculate total AUM
    const totalAUM = clients.reduce((sum, client) => sum + (client.aum || 0), 0);
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl font-bold text-old-money-navy">
            Current Clients
          </h2>
          <button
            onClick={() => setShowCreateClientModal(true)}
            className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add Client</span>
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-old-money-navy/40" />
              <p className="text-old-money-navy/60 text-lg">No clients found</p>
              <p className="text-old-money-navy/40 text-sm mt-2">Add your first client to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-old-money-navy/20">
              <table className="w-full">
                <thead className="bg-old-money-navy text-old-money-cream">
                  <tr>
                    <th className="px-6 py-4 text-left font-serif text-lg font-semibold">
                      Client Name
                    </th>
                    <th className="px-6 py-4 text-left font-serif text-lg font-semibold">
                      Assets Under Management
                    </th>
                    <th className="px-6 py-4 text-left font-serif text-lg font-semibold">
                      Client Since
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/client/${client.id}`)}
                      className={`border-b border-old-money-navy/10 hover:bg-old-money-cream/50 transition-all duration-200 hover:shadow-sm cursor-pointer ${
                        index % 2 === 0 ? 'bg-old-money-cream/20' : 'bg-white'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-old-money-navy">
                        {client.first_name && client.last_name
                          ? `${client.first_name} ${client.middle_name ? client.middle_name + ' ' : ''}${client.last_name}`
                          : client.name}
                      </td>
                      <td className="px-6 py-4 text-old-money-navy">
                        {formatCurrency(client.aum || 0)}
                      </td>
                      <td className="px-6 py-4 text-old-money-navy/70">
                        {client.client_since}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-old-money-navy/5 rounded-lg border border-old-money-navy/20">
              <div className="flex justify-between items-center">
                <span className="font-serif text-lg text-old-money-navy">
                  Total Assets Under Management
                </span>
                <span className="font-serif text-2xl font-bold text-old-money-navy">
                  {formatCurrency(totalAUM)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const NewsAlertsPage = () => {
    // Handle fetching news and sending alerts with AI
    const handleFetchNews = async () => {
      setIsFetchingNews(true);
      try {
        const response = await fetch('http://localhost:3001/api/alerts/fetch-and-send', {
          method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
          const clientSummary = data.clientSummaries && data.clientSummaries.length > 0
            ? data.clientSummaries
                .map(cs => `${cs.client}: ${cs.alertCount} alerts (${cs.highPriority} high priority)`)
                .join('\n')
            : 'No clients matched any articles';

          alert(
            `✅ AI-Powered News Alerts Complete!\n\n` +
            `📰 Fetched: ${data.articlesFetched || 0} articles\n` +
            `💾 Saved: ${data.articlesSaved || 0} new articles\n` +
            `👥 Clients with alerts: ${data.clientsWithAlerts || 0}\n` +
            `📊 Total alerts: ${data.totalAlerts || 0}\n` +
            `📧 Advisor email sent: ${data.advisorEmailSent ? 'Yes' : 'No'}\n` +
            `🤖 AI digest generated: ${data.aiDigestGenerated ? 'Yes' : 'No'}\n\n` +
            `Client Breakdown:\n${clientSummary}`
          );
        } else {
          alert(`❌ Error: ${data.error || 'Unknown error occurred'}`);
        }
      } catch (error) {
        alert(`❌ Error: ${error.message}\n\nMake sure the backend is running on http://localhost:3001`);
        console.error('Fetch error:', error);
      } finally {
        setIsFetchingNews(false);
      }
    };

    // Filter news based on selected filters
    const filteredNews = mockNewsAlerts.filter(news => {
      const priorityMatch = selectedPriority === 'all' || news.priority === selectedPriority;
      const categoryMatch = selectedCategory === 'all' || news.category === selectedCategory;
      const clientMatch = selectedNewsClient === 'all' ||
        news.relevantClients.includes(selectedNewsClient) ||
        news.relevantClients.includes('All Clients');

      return priorityMatch && categoryMatch && clientMatch;
    });

    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'high': return 'bg-red-100 text-red-800 border-red-300';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'low': return 'bg-green-100 text-green-800 border-green-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div className="flex h-full">
        {/* Sidebar Filters */}
        <div className="w-80 border-r border-old-money-navy/20 bg-old-money-cream/30 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-old-money-navy" />
            <h3 className="font-serif text-xl font-semibold text-old-money-navy">
              Filters
            </h3>
          </div>

          {/* Priority Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-old-money-navy mb-2">
              Priority Level
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-old-money-navy/30 rounded-lg bg-white text-old-money-navy focus:outline-none focus:border-old-money-navy transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-old-money-navy mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-old-money-navy/30 rounded-lg bg-white text-old-money-navy focus:outline-none focus:border-old-money-navy transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="Market News">Market News</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Economic Policy">Economic Policy</option>
              <option value="Investment Trends">Investment Trends</option>
              <option value="Alternative Investments">Alternative Investments</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-old-money-navy mb-2">
              Relevant To Client
            </label>
            <select
              value={selectedNewsClient}
              onChange={(e) => setSelectedNewsClient(e.target.value)}
              className="w-full px-3 py-2 border border-old-money-navy/30 rounded-lg bg-white text-old-money-navy focus:outline-none focus:border-old-money-navy transition-colors"
            >
              <option value="all">All Clients</option>
              {mockClients.map(client => (
                <option key={client.id} value={client.name}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="pt-4 border-t border-old-money-navy/20">
            <p className="text-sm text-old-money-navy/60">
              Showing <span className="font-semibold text-old-money-navy">{filteredNews.length}</span> {filteredNews.length === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
        </div>

        {/* News Feed */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-3xl font-bold text-old-money-navy mb-2">
                  News Alerts
                </h2>
                <p className="text-old-money-navy/60">
                  Personalized news based on your clients' portfolios and interests
                </p>
              </div>
              <button
                onClick={handleFetchNews}
                disabled={isFetchingNews}
                className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {isFetchingNews ? '⏳ Fetching...' : '🔄 Fetch News & Send Alerts'}
                </span>
              </button>
            </div>

            {/* News Cards */}
            <div className="space-y-4">
              {filteredNews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-old-money-navy/20">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-old-money-navy/40" />
                  <p className="text-old-money-navy/60">No news alerts match your filters</p>
                </div>
              ) : (
                filteredNews.map((news, index) => (
                  <div
                    key={news.id}
                    className="bg-white rounded-lg border border-old-money-navy/20 p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] group"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded border ${getPriorityColor(news.priority)}`}>
                            {news.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-old-money-navy/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {news.publishedAt}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-old-money-navy mb-2 group-hover:text-old-money-navy/80 transition-colors">
                          {news.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-old-money-navy/80 mb-4 leading-relaxed">
                      {news.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {news.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-old-money-navy/10 text-old-money-navy rounded-full flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-old-money-navy/10">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-old-money-navy/60">
                          Source: <span className="font-semibold text-old-money-navy">{news.source}</span>
                        </span>
                        <span className="text-sm text-old-money-navy/60">
                          {news.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {news.relevantClients[0] !== 'All Clients' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {news.relevantClients.length} {news.relevantClients.length === 1 ? 'client' : 'clients'}
                          </span>
                        )}
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-semibold text-old-money-navy hover:text-old-money-navy/70 transition-colors"
                        >
                          Read More
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClientDetailPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState(null);
    const [portfolioAllocations, setPortfolioAllocations] = useState([]);
    const [clientAccounts, setClientAccounts] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [showPortfolio, setShowPortfolio] = useState(true);
    const [showAlertConfig, setShowAlertConfig] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
      keywords: [],
      excluded_keywords: [],
      priority_threshold: 'medium',
      email_notifications: true,
      categories_enabled: ['market', 'regulatory', 'general']
    });
    const [keywordInput, setKeywordInput] = useState('');
    const [excludedKeywordInput, setExcludedKeywordInput] = useState('');

    useEffect(() => {
      if (selectedClient) {
        setEditedClient({ ...selectedClient });
        // Fetch portfolio data and alert config
        fetchPortfolioData();
        fetchAlertConfig();
      }
    }, [selectedClient]);

    const fetchPortfolioData = async () => {
      if (!selectedClient?.id) return;

      const [allocations, accounts, clientHoldings] = await Promise.all([
        getPortfolioAllocations(selectedClient.id),
        getClientAccounts(selectedClient.id),
        getHoldings(selectedClient.id)
      ]);

      setPortfolioAllocations(allocations);
      setClientAccounts(accounts);
      setHoldings(clientHoldings);
    };

    const fetchAlertConfig = async () => {
      if (!selectedClient?.id) return;

      const config = await getAlertConfig(selectedClient.id);
      if (config) {
        setAlertConfig(config);
      }
    };

    const handleSaveAlertConfig = async () => {
      try {
        await updateAlertConfig(selectedClient.id, alertConfig);
        setShowAlertConfig(false);
        alert('Alert configuration saved successfully!');
      } catch (error) {
        console.error('Error saving alert config:', error);
        alert('Failed to save alert configuration');
      }
    };

    const addKeyword = () => {
      if (keywordInput.trim() && !alertConfig.keywords.includes(keywordInput.trim())) {
        setAlertConfig({
          ...alertConfig,
          keywords: [...alertConfig.keywords, keywordInput.trim()]
        });
        setKeywordInput('');
      }
    };

    const removeKeyword = (keyword) => {
      setAlertConfig({
        ...alertConfig,
        keywords: alertConfig.keywords.filter(k => k !== keyword)
      });
    };

    const addExcludedKeyword = () => {
      if (excludedKeywordInput.trim() && !alertConfig.excluded_keywords.includes(excludedKeywordInput.trim())) {
        setAlertConfig({
          ...alertConfig,
          excluded_keywords: [...alertConfig.excluded_keywords, excludedKeywordInput.trim()]
        });
        setExcludedKeywordInput('');
      }
    };

    const removeExcludedKeyword = (keyword) => {
      setAlertConfig({
        ...alertConfig,
        excluded_keywords: alertConfig.excluded_keywords.filter(k => k !== keyword)
      });
    };

    const toggleCategory = (category) => {
      const categories = alertConfig.categories_enabled.includes(category)
        ? alertConfig.categories_enabled.filter(c => c !== category)
        : [...alertConfig.categories_enabled, category];

      setAlertConfig({
        ...alertConfig,
        categories_enabled: categories
      });
    };

    if (!selectedClient || !editedClient) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-old-money-navy text-lg">No client selected</div>
        </div>
      );
    }

    const handleSave = async () => {
      try {
        // Update in Supabase
        const { data, error } = await supabase
          .from('clients')
          .update(editedClient)
          .eq('id', editedClient.id)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        const updatedClients = clients.map(c => c.id === data.id ? data : c);
        setClients(updatedClients);
        setSelectedClient(data);
        setEditedClient(data);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating client:', error);
        alert('Failed to update client');
      }
    };

    const handleCancel = () => {
      setEditedClient({ ...selectedClient });
      setIsEditing(false);
    };

    const client = isEditing ? editedClient : selectedClient;
    const fullName = client.first_name && client.last_name
      ? `${client.first_name} ${client.middle_name ? client.middle_name + ' ' : ''}${client.last_name}`
      : client.name || 'Unknown Client';

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
    };

    const formatPhone = (phone) => phone || 'Not provided';
    const formatAddress = (street, city, state, zip) => {
      if (!street && !city) return 'Not provided';
      return `${street || ''}, ${city || ''}, ${state || ''} ${zip || ''}`.trim();
    };

    const EditableField = ({ label, value, field, type = 'text', options = null }) => {
      if (!isEditing) {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60">{label}</label>
            <p className="text-old-money-navy">{value || 'Not provided'}</p>
          </div>
        );
      }

      if (type === 'select') {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
            <select
              value={editedClient[field] || ''}
              onChange={(e) => setEditedClient({ ...editedClient, [field]: e.target.value })}
              className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy"
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      }

      if (type === 'checkbox') {
        return (
          <div className="flex items-center justify-between p-3 bg-old-money-cream/30 rounded-lg">
            <span className="text-sm font-semibold text-old-money-navy">{label}</span>
            <input
              type="checkbox"
              checked={editedClient[field] || false}
              onChange={(e) => setEditedClient({ ...editedClient, [field]: e.target.checked })}
              className="w-5 h-5 text-old-money-navy border-old-money-navy/30 rounded focus:ring-old-money-navy"
            />
          </div>
        );
      }

      if (type === 'textarea') {
        return (
          <div>
            <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
            <textarea
              value={editedClient[field] || ''}
              onChange={(e) => setEditedClient({ ...editedClient, [field]: e.target.value })}
              className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy resize-none"
              rows="4"
            />
          </div>
        );
      }

      return (
        <div>
          <label className="text-sm font-semibold text-old-money-navy/60 block mb-1">{label}</label>
          <input
            type={type}
            value={editedClient[field] || ''}
            onChange={(e) => setEditedClient({ ...editedClient, [field]: e.target.value })}
            className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy bg-white text-old-money-navy"
          />
        </div>
      );
    };

    return (
      <div className="h-full overflow-y-auto bg-old-money-cream/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-old-money-navy to-old-money-navy/90 p-6 border-b-4 border-old-money-navy shadow-lg">
          <button
            onClick={() => setActivePage('clients')}
            className="mb-4 flex items-center gap-2 text-old-money-cream/80 hover:text-old-money-cream transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Clients</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-old-money-cream mb-2">
                {fullName}
              </h1>
              <p className="text-old-money-cream/80">
                Client since {client.client_since || 'Unknown'} • {client.account_type || 'Individual'} Account
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <div className="text-old-money-cream/80 text-sm mb-1">Assets Under Management</div>
                <div className="text-3xl font-bold text-old-money-cream">
                  {formatCurrency(client.aum)}
                </div>
              </div>
              {!isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAlertConfig(true)}
                    className="px-4 py-2 bg-old-money-cream/10 text-old-money-cream border-2 border-old-money-cream rounded-lg hover:bg-old-money-cream/20 transition-all duration-200 font-semibold flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Configure Alerts
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-old-money-cream text-old-money-navy rounded-lg hover:bg-old-money-cream/90 transition-all duration-200 font-semibold"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Overview Section */}
        {portfolioAllocations.length > 0 && (
          <div className="p-6 bg-old-money-cream/20">
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-lg border border-old-money-navy/20 hover:shadow-xl transition-all duration-200 mb-4"
            >
              <div className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-old-money-navy" />
                <h2 className="font-serif text-2xl font-bold text-old-money-navy">Portfolio Overview</h2>
              </div>
              {showPortfolio ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>

            {showPortfolio && (
              <div className="space-y-6">
                {/* Account Summary Cards */}
                {clientAccounts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {clientAccounts.map((account) => (
                      <div key={account.id} className="bg-white rounded-xl shadow-lg p-4 border border-old-money-navy/20">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-old-money-navy">{account.account_name}</h3>
                          {account.is_primary && (
                            <span className="px-2 py-1 bg-old-money-navy text-old-money-cream text-xs rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-old-money-navy/60 mb-2">{account.custodian}</p>
                        <p className="text-2xl font-bold text-old-money-navy">{formatCurrency(account.balance)}</p>
                        <p className="text-xs text-old-money-navy/60 mt-1 capitalize">{account.account_type.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Portfolio Allocation Chart and Holdings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                    <h3 className="font-serif text-xl font-bold text-old-money-navy mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RechartsPie>
                        <Pie
                          data={portfolioAllocations}
                          dataKey="value"
                          nameKey="subcategory"
                          cx="50%"
                          cy="50%"
                          outerRadius={130}
                        >
                          {portfolioAllocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#F5F1E8',
                            border: '1px solid #0A1929',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                    <h3 className="font-serif text-xl font-bold text-old-money-navy mb-4">Holdings Breakdown</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {portfolioAllocations.map((allocation) => (
                        <div key={allocation.id} className="border-b border-old-money-navy/10 pb-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: allocation.color }}
                              />
                              <span className="font-semibold text-old-money-navy">{allocation.subcategory}</span>
                            </div>
                            <span className="text-old-money-navy/60">{allocation.percentage}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-old-money-navy/60">{allocation.category}</span>
                            <span className="font-semibold text-old-money-navy">{formatCurrency(allocation.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Holdings Table */}
                {holdings.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
                    <h3 className="font-serif text-xl font-bold text-old-money-navy mb-4">Individual Holdings</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-old-money-navy/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-old-money-navy">Asset</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-old-money-navy">Type</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-old-money-navy">Value</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-old-money-navy">% of Portfolio</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-old-money-navy">Account</th>
                          </tr>
                        </thead>
                        <tbody>
                          {holdings.map((holding) => (
                            <tr key={holding.id} className="border-b border-old-money-navy/10 hover:bg-old-money-cream/30 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-semibold text-old-money-navy">{holding.asset_name}</p>
                                  {holding.ticker_symbol && (
                                    <p className="text-xs text-old-money-navy/60">{holding.ticker_symbol}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-old-money-navy/60 capitalize">{holding.asset_type}</td>
                              <td className="px-4 py-3 text-right font-semibold text-old-money-navy">
                                {formatCurrency(holding.current_value)}
                              </td>
                              <td className="px-4 py-3 text-right text-old-money-navy/60">
                                {holding.allocation_percentage ? `${holding.allocation_percentage}%` : '-'}
                              </td>
                              <td className="px-4 py-3 text-old-money-navy/60">{holding.account_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Information Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </h2>
            <div className="space-y-3">
              <EditableField
                label="Assets Under Management (AUM)"
                value={client.aum}
                field="aum"
                type="number"
              />
              <EditableField
                label="Client Since"
                value={client.client_since}
                field="client_since"
                type="date"
              />
              <EditableField
                label="Account Type"
                value={client.account_type}
                field="account_type"
                type="select"
                options={[
                  { value: 'individual', label: 'Individual' },
                  { value: 'joint', label: 'Joint' },
                  { value: 'trust', label: 'Trust' },
                  { value: 'corporate', label: 'Corporate' }
                ]}
              />
            </div>
          </div>

          {/* Personal Information Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <EditableField label="First Name" value={client.first_name} field="first_name" />
                <EditableField label="Middle Name" value={client.middle_name} field="middle_name" />
                <EditableField label="Last Name" value={client.last_name} field="last_name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <EditableField label="Date of Birth" value={client.date_of_birth} field="date_of_birth" type="date" />
                <EditableField label="Place of Birth" value={client.place_of_birth} field="place_of_birth" />
              </div>
              <EditableField
                label="Social Security Number"
                value={isEditing ? client.ssn : (client.ssn ? '***-**-' + client.ssn.slice(-4) : 'Not provided')}
                field="ssn"
              />
              <EditableField label="Mother's Maiden Name" value={client.mothers_maiden_name} field="mothers_maiden_name" />
            </div>
          </div>

          {/* Contact Information Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <EditableField
                label={`Mobile Phone${client.preferred_phone === 'mobile' ? ' (Preferred)' : ''}`}
                value={client.mobile_phone}
                field="mobile_phone"
                type="tel"
              />
              <EditableField
                label={`Work Phone${client.preferred_phone === 'work' ? ' (Preferred)' : ''}`}
                value={client.work_phone}
                field="work_phone"
                type="tel"
              />
              <EditableField
                label={`Home Phone${client.preferred_phone === 'home' ? ' (Preferred)' : ''}`}
                value={client.home_phone}
                field="home_phone"
                type="tel"
              />
              <EditableField
                label="Preferred Phone"
                value={client.preferred_phone}
                field="preferred_phone"
                type="select"
                options={[
                  { value: '', label: 'None' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'work', label: 'Work' },
                  { value: 'home', label: 'Home' }
                ]}
              />
              <EditableField label="Primary Email" value={client.primary_email} field="primary_email" type="email" />
              <EditableField label="Secondary Email" value={client.secondary_email} field="secondary_email" type="email" />
            </div>
          </div>

          {/* Address Information Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-old-money-navy/80 mb-2">Legal Address</h3>
                <div className="space-y-2">
                  <EditableField label="Street" value={client.legal_street} field="legal_street" />
                  <div className="grid grid-cols-3 gap-2">
                    <EditableField label="City" value={client.legal_city} field="legal_city" />
                    <EditableField label="State" value={client.legal_state} field="legal_state" />
                    <EditableField label="ZIP" value={client.legal_zip} field="legal_zip" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-old-money-navy/80 mb-2">Mailing Address</h3>
                <div className="space-y-2">
                  <EditableField label="Street" value={client.mailing_street} field="mailing_street" />
                  <div className="grid grid-cols-3 gap-2">
                    <EditableField label="City" value={client.mailing_city} field="mailing_city" />
                    <EditableField label="State" value={client.mailing_state} field="mailing_state" />
                    <EditableField label="ZIP" value={client.mailing_zip} field="mailing_zip" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Citizenship & Residency Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Citizenship & Residency
            </h2>
            <div className="space-y-3">
              <EditableField label="U.S. Citizen" value={client.us_citizen} field="us_citizen" type="checkbox" />
              {!client.us_citizen && (
                <>
                  <EditableField label="Country of Citizenship" value={client.country_of_citizenship} field="country_of_citizenship" />
                  <EditableField label="Country of Tax Residence" value={client.country_of_tax_residence} field="country_of_tax_residence" />
                  <EditableField
                    label="Residency Status"
                    value={client.residency_status}
                    field="residency_status"
                    type="select"
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'permanent', label: 'Permanent Resident' },
                      { value: 'non_permanent', label: 'Non-Permanent Resident' },
                      { value: 'nonresident', label: 'Non-Resident' }
                    ]}
                  />
                </>
              )}
            </div>
          </div>

          {/* Employment Information Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Employment Information
            </h2>
            <div className="space-y-3">
              <EditableField
                label="Employment Status"
                value={client.employment_status}
                field="employment_status"
                type="select"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'employed', label: 'Employed' },
                  { value: 'not_employed', label: 'Not Employed' },
                  { value: 'retired', label: 'Retired' }
                ]}
              />
              {client.employment_status === 'employed' && (
                <>
                  <EditableField label="Employer Name" value={client.employer_name} field="employer_name" />
                  <EditableField label="Occupation" value={client.occupation} field="occupation" />
                  <div>
                    <h3 className="text-sm font-bold text-old-money-navy/80 mb-2">Business Address</h3>
                    <div className="space-y-2">
                      <EditableField label="Street" value={client.business_street} field="business_street" />
                      <div className="grid grid-cols-3 gap-2">
                        <EditableField label="City" value={client.business_city} field="business_city" />
                        <EditableField label="State" value={client.business_state} field="business_state" />
                        <EditableField label="ZIP" value={client.business_zip} field="business_zip" />
                      </div>
                    </div>
                  </div>
                  <EditableField label="Tenure (years)" value={client.tenure_years} field="tenure_years" type="number" />
                </>
              )}
              <EditableField
                label="Education Level"
                value={client.education_level}
                field="education_level"
                type="select"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'High School', label: 'High School' },
                  { value: 'Associate', label: 'Associate Degree' },
                  { value: 'Bachelor', label: "Bachelor's Degree" },
                  { value: 'Master', label: "Master's Degree" },
                  { value: 'MBA', label: 'MBA' },
                  { value: 'PhD', label: 'PhD' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
            </div>
          </div>

          {/* Regulatory & Compliance Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Regulatory & Compliance
            </h2>
            <div className="space-y-3">
              <EditableField label="Senior Foreign Political Figure" value={client.is_foreign_political_figure} field="is_foreign_political_figure" type="checkbox" />
              <EditableField label="Control Person / Affiliate (SEC Rule 144)" value={client.is_control_person} field="is_control_person" type="checkbox" />
              <EditableField label="Affiliated with FINRA Member Firm" value={client.is_affiliated_finra} field="is_affiliated_finra" type="checkbox" />
            </div>
          </div>

          {/* Notes Widget - Full Width */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-old-money-navy/20 lg:col-span-2">
            <h2 className="font-serif text-xl font-bold text-old-money-navy mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Notes & Additional Information
            </h2>
            <EditableField label="Notes" value={client.notes} field="notes" type="textarea" />
          </div>
        </div>

        {/* Alert Configuration Modal */}
        {showAlertConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-old-money-navy text-old-money-cream p-6 flex items-center justify-between border-b-4 border-old-money-navy">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6" />
                  <h2 className="font-serif text-2xl font-bold">Configure News Alerts</h2>
                </div>
                <button
                  onClick={() => setShowAlertConfig(false)}
                  className="text-old-money-cream hover:text-old-money-cream/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Keywords Section */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-old-money-navy mb-3">Alert Keywords</h3>
                  <p className="text-sm text-old-money-navy/60 mb-3">
                    Add keywords to monitor. News articles containing these terms will generate alerts.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="Enter keyword (e.g., 'real estate', 'ESG')"
                      className="flex-1 px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy"
                    />
                    <button
                      onClick={addKeyword}
                      className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alertConfig.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-old-money-navy text-old-money-cream rounded-full text-sm flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excluded Keywords Section */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-old-money-navy mb-3">Excluded Keywords</h3>
                  <p className="text-sm text-old-money-navy/60 mb-3">
                    News articles containing these terms will be filtered out.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={excludedKeywordInput}
                      onChange={(e) => setExcludedKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addExcludedKeyword()}
                      placeholder="Enter excluded keyword (e.g., 'spam', 'advertisement')"
                      className="flex-1 px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy"
                    />
                    <button
                      onClick={addExcludedKeyword}
                      className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alertConfig.excluded_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          onClick={() => removeExcludedKeyword(keyword)}
                          className="hover:text-red-900 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Priority Threshold */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-old-money-navy mb-3">Minimum Priority</h3>
                  <p className="text-sm text-old-money-navy/60 mb-3">
                    Only receive alerts at or above this priority level.
                  </p>
                  <select
                    value={alertConfig.priority_threshold}
                    onChange={(e) => setAlertConfig({ ...alertConfig, priority_threshold: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-old-money-navy/20 rounded-lg focus:outline-none focus:border-old-money-navy"
                  >
                    <option value="low">Low - All alerts</option>
                    <option value="medium">Medium - Medium and High</option>
                    <option value="high">High - Only critical alerts</option>
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-old-money-navy mb-3">Alert Categories</h3>
                  <p className="text-sm text-old-money-navy/60 mb-3">
                    Select which types of news you want to receive.
                  </p>
                  <div className="space-y-2">
                    {['market', 'regulatory', 'general'].map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-3 p-3 bg-old-money-cream/30 rounded-lg cursor-pointer hover:bg-old-money-cream/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={alertConfig.categories_enabled.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-5 h-5 text-old-money-navy border-old-money-navy/30 rounded focus:ring-old-money-navy"
                        />
                        <span className="font-semibold text-old-money-navy capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-old-money-navy mb-3">Notification Preferences</h3>
                  <p className="text-sm text-old-money-navy/60 mb-3">
                    Configure how you want to receive alerts. Email notifications will be set up later.
                  </p>
                  <label className="flex items-center gap-3 p-3 bg-old-money-cream/30 rounded-lg cursor-pointer hover:bg-old-money-cream/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={alertConfig.email_notifications}
                      onChange={(e) => setAlertConfig({ ...alertConfig, email_notifications: e.target.checked })}
                      className="w-5 h-5 text-old-money-navy border-old-money-navy/30 rounded focus:ring-old-money-navy"
                    />
                    <span className="font-semibold text-old-money-navy">Email Notifications (Setup Required)</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-old-money-navy/20">
                  <button
                    onClick={() => setShowAlertConfig(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAlertConfig}
                    className="px-6 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 font-semibold"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ClientDashboardPage = () => {
    const [selectedDashboardClient] = useState('The Whitmore Family Trust');

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-old-money-cream/30 to-white">
        {/* Enhanced Header */}
        <div className="p-6 bg-gradient-to-r from-old-money-navy to-old-money-navy/90 border-b-4 border-old-money-navy shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-old-money-cream mb-1">
                {selectedDashboardClient}
              </h2>
              <p className="text-old-money-cream/80 text-sm">
                Last updated: October 16, 2024 • Portfolio Status: Active
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-old-money-cream/20 hover:bg-old-money-cream/30 text-old-money-cream rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-old-money-cream/30">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">AUM: $78.2M</span>
              </button>
              <button className="px-4 py-2 bg-old-money-cream hover:bg-old-money-cream/90 text-old-money-navy rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105">
                Export Dashboard
              </button>
            </div>
          </div>
          <div className="text-old-money-cream/70 text-xs italic">
            Drag and arrange widgets to customize the client view • This dashboard can be shared with clients
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-old-money-cream/20 to-white"
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background
              color="#0A1929"
              gap={20}
              size={1.5}
              style={{ opacity: 0.15 }}
            />
            <Controls
              className="bg-white/90 backdrop-blur-sm border-2 border-old-money-navy/30 rounded-lg shadow-xl m-4"
              style={{
                button: {
                  backgroundColor: 'white',
                  borderBottom: '1px solid rgba(10, 25, 41, 0.1)',
                }
              }}
            />
            <MiniMap
              className="bg-white/90 backdrop-blur-sm border-2 border-old-money-navy/30 rounded-lg shadow-xl m-4"
              nodeColor="#0A1929"
              maskColor="rgba(245, 241, 232, 0.6)"
            />
          </ReactFlow>

          {/* Floating Widget Palette */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border-2 border-old-money-navy/30 rounded-xl shadow-2xl p-4">
            <h3 className="font-serif text-sm font-bold text-old-money-navy mb-3">Widget Types</h3>
            <div className="space-y-2 text-xs text-old-money-navy/70">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span>Net Worth</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="w-3 h-3" />
                <span>Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart className="w-3 h-3" />
                <span>Allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span>Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <StickyNote className="w-3 h-3" />
                <span>Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-3 h-3" />
                <span>News Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsPage = () => (
    <div className="p-8 max-w-2xl">
      <h2 className="font-serif text-3xl font-bold text-old-money-navy mb-6">
        Advisor Profile
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-old-money-navy/20">
        <div className="space-y-6">
          <div>
            <label className="block text-old-money-navy font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={advisorProfile.name}
              onChange={(e) => setAdvisorProfile({...advisorProfile, name: e.target.value})}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded focus:outline-none focus:border-old-money-navy bg-old-money-cream/30"
            />
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={advisorProfile.email}
              onChange={(e) => setAdvisorProfile({...advisorProfile, email: e.target.value})}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded focus:outline-none focus:border-old-money-navy bg-old-money-cream/30"
            />
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={advisorProfile.password}
              onChange={(e) => setAdvisorProfile({...advisorProfile, password: e.target.value})}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded focus:outline-none focus:border-old-money-navy bg-old-money-cream/30"
            />
          </div>

          <button className="w-full bg-old-money-navy text-old-money-cream py-3 rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors">
            Save Changes
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-50 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render current page
  const renderPage = () => {
    switch (activePage) {
      case 'prospects':
        return <ProspectsPage />;
      case 'clients':
        return <ClientsPage />;
      case 'client-detail':
        return <ClientDetailPage />;
      case 'news':
        return <NewsAlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ProspectsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-old-money-cream font-sans">
      {/* Sidebar */}
      <div
        className={`bg-old-money-navy text-old-money-cream transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-6 border-b border-old-money-cream/20">
          <h1 className={`font-serif text-2xl font-bold transition-opacity ${
            sidebarCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            Sentio
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  activePage === item.id
                    ? 'bg-old-money-cream text-old-money-navy font-semibold'
                    : 'text-old-money-cream/80 hover:bg-old-money-cream/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-old-money-cream/20">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-old-money-cream/10 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-old-money-navy/20 px-8 py-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-old-money-navy">
            {activePage === 'client-detail' && selectedClient
              ? `${selectedClient.first_name && selectedClient.last_name
                  ? `${selectedClient.first_name} ${selectedClient.last_name}`
                  : selectedClient.name || 'Client'} Profile`
              : navItems.find(item => item.id === activePage)?.label}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      <CreateProspectModal />
      <CreateClientModal />
      <ConvertToClientModal />
    </div>
  );
}

export default App;
