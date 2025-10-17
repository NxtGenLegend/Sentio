import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Shield, Heart, Target } from 'lucide-react';

const ClientInfo = ({ clientId }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientInfo();
  }, [clientId]);

  const fetchClientInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`);
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading client information...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Client not found</div>
      </div>
    );
  }

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-md border border-old-money-navy/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-old-money-navy/10 rounded-lg">
          <Icon className="w-5 h-5 text-old-money-navy" />
        </div>
        <h3 className="text-lg font-semibold text-old-money-navy">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-old-money-navy/10 last:border-0">
      <span className="text-old-money-navy/60">{label}</span>
      <span className="font-medium text-old-money-navy">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-old-money-cream min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-old-money-navy mb-2">
          {client.first_name} {client.last_name}
        </h1>
        <p className="text-old-money-navy/70">Complete client profile and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <InfoCard title="Personal Information" icon={User}>
          <InfoRow label="First Name" value={client.first_name} />
          <InfoRow label="Middle Name" value={client.middle_name} />
          <InfoRow label="Last Name" value={client.last_name} />
          <InfoRow label="Date of Birth" value={client.date_of_birth} />
          <InfoRow label="Place of Birth" value={client.place_of_birth} />
          <InfoRow label="SSN" value={client.ssn ? '***-**-' + client.ssn.slice(-4) : 'N/A'} />
          <InfoRow label="Mother's Maiden Name" value={client.mothers_maiden_name} />
        </InfoCard>

        {/* Contact Information */}
        <InfoCard title="Contact Information" icon={Mail}>
          <InfoRow label="Primary Email" value={client.primary_email} />
          <InfoRow label="Secondary Email" value={client.secondary_email} />
          <InfoRow label="Mobile Phone" value={client.mobile_phone} />
          <InfoRow label="Home Phone" value={client.home_phone} />
          <InfoRow label="Work Phone" value={client.work_phone} />
          <InfoRow label="Preferred Phone" value={client.preferred_phone} />
        </InfoCard>

        {/* Mailing Address */}
        <InfoCard title="Mailing Address" icon={MapPin}>
          <InfoRow label="Street" value={client.mailing_street} />
          <InfoRow label="City" value={client.mailing_city} />
          <InfoRow label="State" value={client.mailing_state} />
          <InfoRow label="Zip Code" value={client.mailing_zip} />
        </InfoCard>

        {/* Legal Address */}
        <InfoCard title="Legal Address" icon={MapPin}>
          <InfoRow label="Street" value={client.legal_street} />
          <InfoRow label="City" value={client.legal_city} />
          <InfoRow label="State" value={client.legal_state} />
          <InfoRow label="Zip Code" value={client.legal_zip} />
        </InfoCard>

        {/* Business Address */}
        <InfoCard title="Business Address" icon={Briefcase}>
          <InfoRow label="Street" value={client.business_street} />
          <InfoRow label="City" value={client.business_city} />
          <InfoRow label="State" value={client.business_state} />
          <InfoRow label="Zip Code" value={client.business_zip} />
        </InfoCard>

        {/* Professional Information */}
        <InfoCard title="Professional Information" icon={Briefcase}>
          <InfoRow label="Occupation" value={client.occupation} />
          <InfoRow label="Employer Name" value={client.employer_name} />
          <InfoRow label="Employment Status" value={client.employment_status} />
          <InfoRow label="Education Level" value={client.education_level} />
        </InfoCard>

        {/* Account Information */}
        <InfoCard title="Account Information" icon={DollarSign}>
          <InfoRow label="Assets Under Management" value={client.aum ? `$${Number(client.aum).toLocaleString()}` : 'N/A'} />
          <InfoRow label="Account Type" value={client.account_type} />
          <InfoRow label="Client Since" value={client.client_since ? new Date(client.client_since).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Tenure Years" value={client.tenure_years} />
          <InfoRow label="Status" value={client.status} />
        </InfoCard>

        {/* Compliance & Regulatory */}
        <InfoCard title="Compliance & Regulatory" icon={Shield}>
          <InfoRow label="US Citizen" value={client.us_citizen ? 'Yes' : 'No'} />
          <InfoRow label="Residency Status" value={client.residency_status} />
          <InfoRow label="Country of Citizenship" value={client.country_of_citizenship} />
          <InfoRow label="Country of Tax Residence" value={client.country_of_tax_residence} />
          <InfoRow label="FINRA Affiliated" value={client.is_affiliated_finra ? 'Yes' : 'No'} />
          <InfoRow label="Control Person" value={client.is_control_person ? 'Yes' : 'No'} />
          <InfoRow label="Foreign Political Figure" value={client.is_foreign_political_figure ? 'Yes' : 'No'} />
        </InfoCard>
      </div>

      {/* Additional Notes */}
      {client.notes && (
        <div className="mt-6">
          <InfoCard title="Additional Notes" icon={User}>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </InfoCard>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Client Since:</span>{' '}
            {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{' '}
            {client.updated_at ? new Date(client.updated_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
