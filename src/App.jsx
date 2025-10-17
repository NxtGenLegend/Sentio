import React, { useState, useCallback, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { getClients, getProspects } from './lib/supabase';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('prospects');
  const [selectedProspect, setSelectedProspect] = useState(null);
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
  const [selectedClient, setSelectedClient] = useState('all');

  // Navigation items
  const navItems = [
    { id: 'prospects', label: 'Prospects', icon: Users },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    { id: 'news', label: 'News Alerts', icon: Newspaper },
    { id: 'dashboard', label: 'Client Dashboard', icon: LayoutDashboard },
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
            <h3 className="font-serif text-xl font-semibold text-old-money-navy mb-4">
              Pipeline
            </h3>
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
      <div className="flex-1 overflow-y-auto">
        {selectedProspect ? (
          <div className="p-8">
            <h2 className="font-serif text-3xl font-bold text-old-money-navy mb-2">
              {selectedProspect.name}
            </h2>
            <p className="text-old-money-navy/60 text-lg mb-6">
              {selectedProspect.company}
            </p>

            {/* Tags */}
            {selectedProspect.tags && selectedProspect.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-serif text-lg font-semibold text-old-money-navy mb-2">
                  Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProspect.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-old-money-navy/10 text-old-money-navy rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedProspect.notes && (
              <div className="mb-6">
                <h3 className="font-serif text-lg font-semibold text-old-money-navy mb-2">
                  Notes
                </h3>
                <p className="text-old-money-navy/80 leading-relaxed">
                  {selectedProspect.notes}
                </p>
              </div>
            )}

            {/* Interaction Log */}
            {selectedProspect.interactions && selectedProspect.interactions.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-old-money-navy mb-3">
                  Interaction History
                </h3>
                <div className="space-y-4">
                  {selectedProspect.interactions.map((interaction, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-old-money-navy/30 pl-4 py-2"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-old-money-navy">
                          {interaction.type}
                        </span>
                        <span className="text-sm text-old-money-navy/60">
                          {interaction.date}
                        </span>
                      </div>
                      <p className="text-old-money-navy/80 text-sm">
                        {interaction.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-old-money-navy/60">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p>Select a prospect to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  const ClientsPage = () => (
    <div className="p-8">
      <h2 className="font-serif text-3xl font-bold text-old-money-navy mb-6">
        Current Clients
      </h2>

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
            {mockClients.map((client, index) => (
              <tr
                key={client.id}
                className={`border-b border-old-money-navy/10 hover:bg-old-money-cream/50 transition-all duration-200 hover:shadow-sm cursor-pointer ${
                  index % 2 === 0 ? 'bg-old-money-cream/20' : 'bg-white'
                }`}
              >
                <td className="px-6 py-4 font-semibold text-old-money-navy">
                  {client.name}
                </td>
                <td className="px-6 py-4 text-old-money-navy">
                  {client.aum}
                </td>
                <td className="px-6 py-4 text-old-money-navy/70">
                  {client.clientSince}
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
            $297,000,000
          </span>
        </div>
      </div>
    </div>
  );

  const NewsAlertsPage = () => {
    // Filter news based on selected filters
    const filteredNews = mockNewsAlerts.filter(news => {
      const priorityMatch = selectedPriority === 'all' || news.priority === selectedPriority;
      const categoryMatch = selectedCategory === 'all' || news.category === selectedCategory;
      const clientMatch = selectedClient === 'all' ||
        news.relevantClients.includes(selectedClient) ||
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
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
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
              <button className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 flex items-center gap-2 hover:scale-105">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-semibold">Configure Alerts</span>
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

  const ClientDashboardPage = () => {
    const [selectedClient] = useState('The Whitmore Family Trust');

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-old-money-cream/30 to-white">
        {/* Enhanced Header */}
        <div className="p-6 bg-gradient-to-r from-old-money-navy to-old-money-navy/90 border-b-4 border-old-money-navy shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-old-money-cream mb-1">
                {selectedClient}
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
      case 'news':
        return <NewsAlertsPage />;
      case 'dashboard':
        return <ClientDashboardPage />;
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
            {navItems.find(item => item.id === activePage)?.label}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
