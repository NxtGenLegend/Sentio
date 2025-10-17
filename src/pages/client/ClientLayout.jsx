import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Bell, TrendingUp, ArrowLeft, Settings } from 'lucide-react';
import ClientDashboard from './ClientDashboard';
import ClientInfo from './ClientInfo';

const ClientLayout = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState(null);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'info') return 'info';
    return 'dashboard';
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`);
      const data = await response.json();
      console.log('Client data received:', data);
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '' },
    { id: 'info', label: 'Client Info', icon: User, path: 'info' },
    // Commented out until implemented
    // { id: 'documents', label: 'Documents', icon: FileText, path: 'documents' },
    // { id: 'alerts', label: 'News Alerts', icon: Bell, path: 'alerts' },
    // { id: 'performance', label: 'Performance', icon: TrendingUp, path: 'performance' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-old-money-cream">
      {/* Internal Sidebar */}
      <div className="w-64 bg-old-money-navy border-r border-old-money-navy flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-old-money-cream/20">
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2 text-old-money-cream/70 hover:text-old-money-cream transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Clients</span>
          </button>

          {client && (
            <div>
              <h2 className="text-xl font-bold text-old-money-cream">
                {client.first_name} {client.last_name}
              </h2>
              <p className="text-sm text-old-money-cream/70">
                AUM: ${client.aum ? Number(client.aum).toLocaleString() : 'Not Set'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveTab() === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/client/${clientId}/${item.path}`);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-old-money-cream text-old-money-navy font-medium shadow-lg'
                      : 'text-old-money-cream hover:bg-old-money-navy-light'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-old-money-cream/20">
          <div className="text-xs text-old-money-cream/50">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<ClientDashboard clientId={clientId} />} />
          <Route path="info" element={<ClientInfo clientId={clientId} />} />
        </Routes>
      </div>
    </div>
  );
};

export default ClientLayout;
