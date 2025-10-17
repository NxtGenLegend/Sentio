import React from 'react';
import { User, DollarSign, Calendar, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientCard = ({ client }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTenureYears = (clientSince) => {
    if (!clientSince) return 0;
    const years = new Date().getFullYear() - new Date(clientSince).getFullYear();
    return years;
  };

  return (
    <div
      onClick={() => navigate(`/client/${client.id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-old-money-navy/10 hover:border-old-money-gold/50 transform hover:-translate-y-1 overflow-hidden group"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-old-money-navy to-old-money-navy/90 p-6 text-old-money-cream">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-old-money-cream/20 flex items-center justify-center ring-2 ring-old-money-cream/30">
              <User className="w-6 h-6 text-old-money-cream" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif">
                {client.first_name && client.last_name
                  ? `${client.first_name} ${client.middle_name ? client.middle_name + ' ' : ''}${client.last_name}`
                  : client.name}
              </h3>
              <p className="text-old-money-cream/70 text-sm">
                {client.occupation || 'No occupation listed'}
              </p>
            </div>
          </div>
          {client.status && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
          )}
        </div>
      </div>

      {/* AUM Section */}
      <div className="bg-old-money-gold/10 p-4 border-b border-old-money-navy/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-old-money-navy/60" />
            <span className="text-sm font-medium text-old-money-navy/70">Assets Under Management</span>
          </div>
          <span className="text-2xl font-bold text-old-money-navy font-serif">
            {formatCurrency(client.aum || 0)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Client Since */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-old-money-navy/60 mt-0.5" />
            <div>
              <p className="text-xs text-old-money-navy/60">Client Since</p>
              <p className="text-sm font-semibold text-old-money-navy">
                {formatDate(client.client_since)}
              </p>
              {client.client_since && (
                <p className="text-xs text-old-money-navy/50">
                  {getTenureYears(client.client_since)} years
                </p>
              )}
            </div>
          </div>

          {/* Account Type */}
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-old-money-navy/60 mt-0.5" />
            <div>
              <p className="text-xs text-old-money-navy/60">Account Type</p>
              <p className="text-sm font-semibold text-old-money-navy">
                {client.account_type || 'Standard'}
              </p>
            </div>
          </div>

          {/* Email */}
          {client.primary_email && (
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-old-money-navy/60 mt-0.5" />
              <div>
                <p className="text-xs text-old-money-navy/60">Email</p>
                <p className="text-sm font-medium text-old-money-navy truncate max-w-[150px]">
                  {client.primary_email}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {client.mobile_phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-old-money-navy/60 mt-0.5" />
              <div>
                <p className="text-xs text-old-money-navy/60">Phone</p>
                <p className="text-sm font-medium text-old-money-navy">
                  {client.mobile_phone}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {(client.mailing_city || client.mailing_state) && (
            <div className="flex items-start gap-2 col-span-2">
              <MapPin className="w-4 h-4 text-old-money-navy/60 mt-0.5" />
              <div>
                <p className="text-xs text-old-money-navy/60">Location</p>
                <p className="text-sm font-medium text-old-money-navy">
                  {[client.mailing_city, client.mailing_state].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {client.notes && (
          <div className="pt-4 border-t border-old-money-navy/10">
            <p className="text-xs text-old-money-navy/60 mb-1">Notes</p>
            <p className="text-sm text-old-money-navy/80 line-clamp-2">
              {client.notes}
            </p>
          </div>
        )}
      </div>

      {/* Hover Action */}
      <div className="px-6 pb-4">
        <div className="text-center py-2 bg-old-money-navy/5 rounded-lg group-hover:bg-old-money-navy group-hover:text-old-money-cream transition-all duration-300">
          <span className="text-sm font-semibold">View Client Details →</span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
