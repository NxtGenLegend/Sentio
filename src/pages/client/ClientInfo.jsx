import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Shield, Heart, Target, Edit2, Save, X } from 'lucide-react';

const ClientInfo = ({ clientId }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClientInfo();
  }, [clientId]);

  const fetchClientInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`);
      const data = await response.json();
      setClient(data);
      setEditedClient(data);
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedClient({ ...client });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedClient({ ...client });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedClient)
      });

      if (response.ok) {
        const { data } = await response.json();
        setClient(data);
        setEditedClient(data);
        setIsEditing(false);
        alert('Client information updated successfully!');
      } else {
        throw new Error('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client information');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedClient(prev => ({ ...prev, [field]: value }));
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

  const InfoRow = ({ label, value, field, type = 'text', editable = true }) => {
    const displayValue = isEditing && editable ? editedClient[field] : value;

    return (
      <div className="flex justify-between items-center py-2 border-b border-old-money-navy/10 last:border-0">
        <span className="text-old-money-navy/60 min-w-[140px]">{label}</span>
        {isEditing && editable ? (
          <input
            type={type}
            value={displayValue || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="font-medium text-old-money-navy bg-old-money-cream border border-old-money-navy/30 rounded px-2 py-1 text-right flex-1 max-w-[300px] focus:outline-none focus:ring-2 focus:ring-old-money-gold"
          />
        ) : (
          <span className="font-medium text-old-money-navy text-right flex-1">{value || 'N/A'}</span>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-old-money-cream min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-old-money-navy mb-2">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-old-money-navy/70">Complete client profile and information</p>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Edit Client Info
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all shadow-md"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-old-money-gold text-old-money-navy rounded-lg hover:bg-old-money-gold/90 transition-all shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <InfoCard title="Personal Information" icon={User}>
          <InfoRow label="First Name" value={client.first_name} field="first_name" />
          <InfoRow label="Middle Name" value={client.middle_name} field="middle_name" />
          <InfoRow label="Last Name" value={client.last_name} field="last_name" />
          <InfoRow label="Date of Birth" value={client.date_of_birth} field="date_of_birth" type="date" />
          <InfoRow label="Place of Birth" value={client.place_of_birth} field="place_of_birth" />
          <InfoRow label="SSN" value={client.ssn ? '***-**-' + client.ssn.slice(-4) : 'N/A'} field="ssn" />
          <InfoRow label="Mother's Maiden Name" value={client.mothers_maiden_name} field="mothers_maiden_name" />
        </InfoCard>

        {/* Contact Information */}
        <InfoCard title="Contact Information" icon={Mail}>
          <InfoRow label="Primary Email" value={client.primary_email} field="primary_email" type="email" />
          <InfoRow label="Secondary Email" value={client.secondary_email} field="secondary_email" type="email" />
          <InfoRow label="Mobile Phone" value={client.mobile_phone} field="mobile_phone" type="tel" />
          <InfoRow label="Home Phone" value={client.home_phone} field="home_phone" type="tel" />
          <InfoRow label="Work Phone" value={client.work_phone} field="work_phone" type="tel" />
          <InfoRow label="Preferred Phone" value={client.preferred_phone} field="preferred_phone" />
        </InfoCard>

        {/* Mailing Address */}
        <InfoCard title="Mailing Address" icon={MapPin}>
          <InfoRow label="Street" value={client.mailing_street} field="mailing_street" />
          <InfoRow label="City" value={client.mailing_city} field="mailing_city" />
          <InfoRow label="State" value={client.mailing_state} field="mailing_state" />
          <InfoRow label="Zip Code" value={client.mailing_zip} field="mailing_zip" />
        </InfoCard>

        {/* Legal Address */}
        <InfoCard title="Legal Address" icon={MapPin}>
          <InfoRow label="Street" value={client.legal_street} field="legal_street" />
          <InfoRow label="City" value={client.legal_city} field="legal_city" />
          <InfoRow label="State" value={client.legal_state} field="legal_state" />
          <InfoRow label="Zip Code" value={client.legal_zip} field="legal_zip" />
        </InfoCard>

        {/* Business Address */}
        <InfoCard title="Business Address" icon={Briefcase}>
          <InfoRow label="Street" value={client.business_street} field="business_street" />
          <InfoRow label="City" value={client.business_city} field="business_city" />
          <InfoRow label="State" value={client.business_state} field="business_state" />
          <InfoRow label="Zip Code" value={client.business_zip} field="business_zip" />
        </InfoCard>

        {/* Professional Information */}
        <InfoCard title="Professional Information" icon={Briefcase}>
          <InfoRow label="Occupation" value={client.occupation} field="occupation" />
          <InfoRow label="Employer Name" value={client.employer_name} field="employer_name" />
          <InfoRow label="Employment Status" value={client.employment_status} field="employment_status" />
          <InfoRow label="Education Level" value={client.education_level} field="education_level" />
        </InfoCard>

        {/* Account Information */}
        <InfoCard title="Account Information" icon={DollarSign}>
          <InfoRow label="Assets Under Management" value={client.aum ? `$${Number(client.aum).toLocaleString()}` : 'N/A'} field="aum" type="number" />
          <InfoRow label="Account Type" value={client.account_type} field="account_type" />
          <InfoRow label="Client Since" value={client.client_since ? new Date(client.client_since).toLocaleDateString() : 'N/A'} field="client_since" type="date" />
          <InfoRow label="Tenure Years" value={client.tenure_years} field="tenure_years" type="number" />
          <InfoRow label="Status" value={client.status} field="status" />
        </InfoCard>

        {/* Compliance & Regulatory */}
        <InfoCard title="Compliance & Regulatory" icon={Shield}>
          <InfoRow label="US Citizen" value={client.us_citizen ? 'Yes' : 'No'} field="us_citizen" editable={false} />
          <InfoRow label="Residency Status" value={client.residency_status} field="residency_status" />
          <InfoRow label="Country of Citizenship" value={client.country_of_citizenship} field="country_of_citizenship" />
          <InfoRow label="Country of Tax Residence" value={client.country_of_tax_residence} field="country_of_tax_residence" />
          <InfoRow label="FINRA Affiliated" value={client.is_affiliated_finra ? 'Yes' : 'No'} field="is_affiliated_finra" editable={false} />
          <InfoRow label="Control Person" value={client.is_control_person ? 'Yes' : 'No'} field="is_control_person" editable={false} />
          <InfoRow label="Foreign Political Figure" value={client.is_foreign_political_figure ? 'Yes' : 'No'} field="is_foreign_political_figure" editable={false} />
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
