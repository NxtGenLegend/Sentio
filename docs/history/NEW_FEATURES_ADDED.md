# ✅ New Features Added

## 1. SQL Script to Remove Duplicates

**File:** `REMOVE_DUPLICATES.sql`

**What it does:** Removes all duplicate clients, prospects, news alerts, and interactions from your Supabase database.

**How to use:**
1. Open Supabase SQL Editor
2. Copy entire contents of `REMOVE_DUPLICATES.sql`
3. Run it
4. You should go from 10 clients → 5 unique clients

---

## 2. New Functions in supabase.js

Added these helper functions in `/src/lib/supabase.js`:

### `createClient(clientData)`
Creates a new client directly in Supabase.

```javascript
await createClient({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 555-0123',
  aum: 5000000,
  client_since: '2024-10-16',
  account_type: 'individual',
  profile: {
    holdings: ['Stocks', 'Bonds'],
    interests: ['Technology', 'ESG'],
    riskTolerance: 'moderate',
    investmentStyle: 'growth',
    tags: ['Tech', 'Growth']
  }
});
```

### `convertProspectToClient(prospectId, clientData)`
Converts a prospect to a client (moves them from prospects table to clients table).

```javascript
await convertProspectToClient(prospect.id, {
  aum: 10000000,
  client_since: '2024-10-16',
  account_type: 'individual'
});
```

### `deleteProspect(prospectId)`
Deletes a prospect from the database.

---

## 3. UI Components Needed (App.jsx)

Due to the file size, I couldn't add the modals directly. Here's what needs to be added to `App.jsx`:

### A. Add Modal State (line ~820, after existing state)

```javascript
// Modal state
const [showCreateProspectModal, setShowCreateProspectModal] = useState(false);
const [showCreateClientModal, setShowCreateClientModal] = useState(false);
const [showConvertModal, setShowConvertModal] = useState(false);
```

### B. Add "Add Prospect" Button in ProspectsPage

**In the left sidebar header** (around line 1095, after "Pipeline" heading):

```javascript
<div className="p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-serif text-xl font-semibold text-old-money-navy">
      Pipeline
    </h3>
    <button
      onClick={() => setShowCreateProspectModal(true)}
      className="p-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200"
      title="Add New Prospect"
    >
      <Plus className="w-5 h-5" />
    </button>
  </div>
  {/* ... rest of prospects list */}
</div>
```

### C. Add "Convert to Client" Button in Prospect Details

**In the prospect details section** (around line 1140, after the prospect name):

```javascript
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="font-serif text-3xl font-bold text-old-money-navy mb-2">
      {selectedProspect.name}
    </h2>
    <p className="text-old-money-navy/60 text-lg">
      {selectedProspect.company}
    </p>
  </div>
  <button
    onClick={() => setShowConvertModal(true)}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
  >
    <ArrowRight className="w-4 h-4" />
    Convert to Client
  </button>
</div>
```

### D. Add "Add Client" Button in ClientsPage

**In the header** (around line 1222, after "Current Clients"):

```javascript
<div className="flex items-center justify-between mb-6">
  <h2 className="font-serif text-3xl font-bold text-old-money-navy">
    Current Clients
  </h2>
  <button
    onClick={() => setShowCreateClientModal(true)}
    className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 transition-all duration-200 flex items-center gap-2"
  >
    <Plus className="w-4 h-4" />
    Add New Client
  </button>
</div>
```

---

## 4. Modal Components

### Create Prospect Modal

Add this **before** the `return` statement in the main App component (around line 1660):

```javascript
// Modal: Create Prospect
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

      // Close modal
      setShowCreateProspectModal(false);
      setFormData({
        name: '', email: '', phone: '', company: '', status: 'new',
        estimated_aum: '', notes: '', tags: ''
      });
    } catch (error) {
      console.error('Error creating prospect:', error);
      alert('Failed to create prospect');
    }
  };

  if (!showCreateProspectModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-old-money-navy">Add New Prospect</h2>
          <button
            onClick={() => setShowCreateProspectModal(false)}
            className="text-old-money-navy/60 hover:text-old-money-navy"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
                required
              />
            </div>
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Estimated AUM ($)</label>
              <input
                type="number"
                value={formData.estimated_aum}
                onChange={(e) => setFormData({ ...formData, estimated_aum: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
                placeholder="5000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              placeholder="Tech Founder, Exit Planning"
            />
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy resize-none"
              rows={4}
              placeholder="Any relevant notes about this prospect..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateProspectModal(false)}
              className="flex-1 px-4 py-3 border border-old-money-navy/30 rounded-lg font-semibold hover:bg-old-money-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-old-money-navy text-old-money-cream rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors"
            >
              Add Prospect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### Create Client Modal

Add this after the Create Prospect Modal:

```javascript
// Modal: Create Client
const CreateClientModal = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aum: '',
    client_since: new Date().toISOString().split('T')[0],
    account_type: 'individual',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClient({
        ...formData,
        aum: formData.aum ? parseFloat(formData.aum) : 0,
        profile: {
          holdings: [],
          interests: [],
          riskTolerance: 'moderate',
          investmentStyle: 'balanced',
          tags: []
        }
      });

      // Reload clients
      const clientsData = await getClients();
      setClients(clientsData || []);

      // Close modal
      setShowCreateClientModal(false);
      setFormData({
        name: '', email: '', phone: '', aum: '',
        client_since: new Date().toISOString().split('T')[0],
        account_type: 'individual', notes: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    }
  };

  if (!showCreateClientModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-old-money-navy">Add New Client</h2>
          <button
            onClick={() => setShowCreateClientModal(false)}
            className="text-old-money-navy/60 hover:text-old-money-navy"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Client Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">AUM ($) *</label>
              <input
                type="number"
                value={formData.aum}
                onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
                required
                placeholder="5000000"
              />
            </div>
            <div>
              <label className="block text-old-money-navy font-semibold mb-2">Client Since</label>
              <input
                type="date"
                value={formData.client_since}
                onChange={(e) => setFormData({ ...formData, client_since: e.target.value })}
                className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Account Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
            >
              <option value="individual">Individual</option>
              <option value="joint">Joint</option>
              <option value="trust">Trust</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy resize-none"
              rows={4}
              placeholder="Any relevant notes about this client..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateClientModal(false)}
              className="flex-1 px-4 py-3 border border-old-money-navy/30 rounded-lg font-semibold hover:bg-old-money-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-old-money-navy text-old-money-cream rounded-lg font-semibold hover:bg-old-money-navy/90 transition-colors"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### Convert Prospect to Client Modal

Add this after the Create Client Modal:

```javascript
// Modal: Convert Prospect to Client
const ConvertToClientModal = () => {
  const [formData, setFormData] = useState({
    aum: '',
    client_since: new Date().toISOString().split('T')[0],
    account_type: 'individual'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProspect) return;

    try {
      await convertProspectToClient(selectedProspect.id, {
        aum: formData.aum ? parseFloat(formData.aum) : 0,
        client_since: formData.client_since,
        account_type: formData.account_type
      });

      // Reload both prospects and clients
      const [clientsData, prospectsData] = await Promise.all([
        getClients(),
        getProspects()
      ]);
      setClients(clientsData || []);
      setProspects(prospectsData || []);
      setSelectedProspect(prospectsData[0] || null);

      // Close modal
      setShowConvertModal(false);
      alert(`${selectedProspect.name} has been converted to a client!`);
    } catch (error) {
      console.error('Error converting prospect:', error);
      alert('Failed to convert prospect to client');
    }
  };

  if (!showConvertModal || !selectedProspect) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-old-money-navy">Convert to Client</h2>
          <button
            onClick={() => setShowConvertModal(false)}
            className="text-old-money-navy/60 hover:text-old-money-navy"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-old-money-navy/70 mb-6">
          Convert <strong>{selectedProspect.name}</strong> to a client. Their information will be moved to the clients database.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Assets Under Management ($) *</label>
            <input
              type="number"
              value={formData.aum}
              onChange={(e) => setFormData({ ...formData, aum: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
              required
              placeholder="5000000"
            />
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Client Since</label>
            <input
              type="date"
              value={formData.client_since}
              onChange={(e) => setFormData({ ...formData, client_since: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
            />
          </div>

          <div>
            <label className="block text-old-money-navy font-semibold mb-2">Account Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-4 py-2 border border-old-money-navy/30 rounded-lg focus:outline-none focus:border-old-money-navy"
            >
              <option value="individual">Individual</option>
              <option value="joint">Joint</option>
              <option value="trust">Trust</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowConvertModal(false)}
              className="flex-1 px-4 py-3 border border-old-money-navy/30 rounded-lg font-semibold hover:bg-old-money-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Convert to Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### E. Render the Modals

Add these at the **very end** of the main return statement, just before the closing `</div>`:

```javascript
      {/* Modals */}
      <CreateProspectModal />
      <CreateClientModal />
      <ConvertToClientModal />
    </div>
  );
}
```

---

## Summary

**What you have now:**
1. ✅ SQL script to remove duplicates (`REMOVE_DUPLICATES.sql`)
2. ✅ Helper functions in `supabase.js` to create/convert/delete
3. ⚠️ **Need to add:** Modal components and buttons to App.jsx

**What you need to do:**
1. Run `REMOVE_DUPLICATES.sql` in Supabase to clean up duplicate data
2. Add the modal code above to your `App.jsx` file
3. Restart your frontend if it's running

**File size issue:** App.jsx is too large (1700+ lines). I couldn't directly edit it, but the code above shows exactly where and what to add.

Would you like me to create a separate file with just the modal components that you can copy from?
