# Client Dashboard with Draggable Asset Widgets

## Overview

The system now includes a comprehensive client dashboard with draggable financial asset widgets using React Flow. When you click on a client, you're taken to a new page with internal navigation and a customizable dashboard.

---

## Features Implemented

### 1. Client Page Navigation
- **New Routing Structure**: `/client/:clientId` routes to a dedicated client page
- **Internal Sidebar Navigation** with tabs:
  - Dashboard (default) - Draggable asset widgets
  - Client Info - All non-asset client information
  - Documents - Coming soon
  - News Alerts - Coming soon
  - Performance - Coming soon
  - Settings - Coming soon

### 2. Draggable Asset Widgets
Created 7 widget types with React Flow:

1. **Stock Position Widget**
   - Ticker, shares, price, value
   - Daily change % with visual indicator

2. **Bond Position Widget**
   - Issuer, face value, coupon rate
   - Maturity date, yield, market value

3. **Real Estate Widget**
   - Property name, location
   - Purchase price, current value
   - Annual income, ROI

4. **Private Equity Widget**
   - Fund name, investment amount
   - Current value, IRR, vintage year

5. **Crypto Asset Widget**
   - Asset name (BTC, ETH, etc.)
   - Amount, price, total value
   - 24h change %

6. **Portfolio Summary Widget**
   - Total portfolio value
   - Breakdown by asset class (stocks, bonds, real estate, other)

7. **Alternative Investment Widget**
   - Asset type (art, collectibles, etc.)
   - Description, investment, current value

### 3. Dashboard Features
- **Add Widget Button**: Opens widget library to add new widgets
- **Drag & Drop**: All widgets can be dragged around the canvas
- **Remove Widgets**: Each widget has an X button to remove it
- **Save Layout**: Saves dashboard configuration to database
- **Clear All**: Removes all widgets
- **Auto-Load**: Dashboard state loads automatically from database
- **Mini Map**: Shows overview of entire canvas
- **Zoom Controls**: Zoom in/out and fit to view

---

## File Structure

### Frontend Components

```
src/
├── AppRouter.jsx                          # Main router configuration
├── main.jsx                               # Updated to use AppRouter
├── App.jsx                                # Modified to support React Router
├── components/
│   └── dashboard/
│       └── AssetWidgets.jsx              # All 7 widget components
└── pages/
    └── client/
        ├── ClientLayout.jsx              # Client page with internal sidebar
        ├── ClientDashboard.jsx           # React Flow dashboard
        └── ClientInfo.jsx                # Non-asset client information
```

### Backend API

```
backend/src/
├── routes/
│   └── dashboard.js                      # Dashboard CRUD API
├── migrations/
│   └── create_client_dashboards.sql     # Database table
└── server.js                             # Added dashboard routes
```

---

## How to Use

### 1. Access Client Dashboard
1. Go to the Clients page
2. Click on any client row
3. You'll be redirected to `/client/{clientId}` with the dashboard view

### 2. Add Widgets
1. Click the "Add Widget" button (top-left)
2. Select from 7 widget types
3. Widget appears on canvas with sample data
4. Drag it to desired position

### 3. Customize Layout
- **Drag**: Click and drag any widget
- **Remove**: Click the X button on each widget
- **Save**: Click "Save Layout" to persist changes
- **Clear**: Click "Clear All" to remove all widgets

### 4. View Client Info
1. Click "Client Info" in the left sidebar
2. View all non-asset information:
   - Personal Information (name, age, DOB, marital status)
   - Contact Information (email, phone, address)
   - Professional Information (occupation, employer, income)
   - Financial Overview (net worth, assets, debt, credit score)
   - Investment Profile (risk tolerance, experience, goals)
   - Insurance & Estate Planning
   - Retirement Planning
   - Healthcare & Long-term Care

---

## Database Setup

Run the migration to create the dashboard storage table:

```sql
-- File: backend/migrations/create_client_dashboards.sql

CREATE TABLE IF NOT EXISTS client_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);
```

### Run Migration in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `backend/migrations/create_client_dashboards.sql`
3. Run the SQL
4. Verify table created successfully

---

## API Endpoints

### GET /api/dashboard/:clientId
Get dashboard layout for a client

**Response:**
```json
{
  "layout": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### POST /api/dashboard/:clientId
Save dashboard layout

**Request Body:**
```json
{
  "layout": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

### DELETE /api/dashboard/:clientId
Delete dashboard layout

**Response:**
```json
{
  "success": true,
  "message": "Dashboard deleted successfully"
}
```

---

## Widget Data Structure

Each widget type has specific data properties:

### Stock Widget
```javascript
{
  ticker: 'AAPL',
  shares: 100,
  price: 150.25,
  value: 15025,
  change: 2.5  // Percentage
}
```

### Bond Widget
```javascript
{
  issuer: 'US Treasury',
  faceValue: 10000,
  couponRate: 4.5,
  maturityDate: '2030-12-31',
  yield: 4.2,
  marketValue: 10500
}
```

### Real Estate Widget
```javascript
{
  propertyName: 'Downtown Office',
  location: 'New York, NY',
  purchasePrice: 2000000,
  currentValue: 2500000,
  annualIncome: 150000,
  roi: 7.5
}
```

---

## Customization

### Adding New Widget Types

1. **Create Widget Component** in `AssetWidgets.jsx`:
```javascript
export const MyCustomWidget = ({ data }) => {
  return (
    <WidgetWrapper title="My Widget" icon={MyIcon} color="purple">
      {/* Your widget content */}
    </WidgetWrapper>
  );
};
```

2. **Add to widgetTypes** mapping:
```javascript
export const widgetTypes = {
  // ...existing types
  myCustom: MyCustomWidget,
};
```

3. **Add to widget templates** in `ClientDashboard.jsx`:
```javascript
const widgetTemplates = [
  // ...existing templates
  {
    type: 'myCustom',
    label: 'My Custom Widget',
    icon: '🎨',
    defaultData: { /* default values */ }
  }
];
```

---

## Next Steps (Future Enhancements)

1. **Connect Real Data**: Replace sample data with actual client holdings from database
2. **Real-time Updates**: Add websocket connections for live price updates
3. **Widget Linking**: Connect related widgets (e.g., stock → portfolio summary)
4. **Templates**: Create pre-built dashboard templates by client type
5. **Export**: Add PDF/image export functionality
6. **Analytics**: Track which widgets are most used
7. **Permissions**: Add role-based access to different widgets
8. **Mobile**: Optimize layout for mobile/tablet views

---

## Troubleshooting

### Dashboard Not Loading
- Check browser console for errors
- Verify backend server is running on port 3001
- Ensure database table `client_dashboards` exists

### Widgets Not Saving
- Check network tab for failed API calls
- Verify client_id is valid UUID
- Check Supabase permissions on client_dashboards table

### Navigation Not Working
- Clear browser cache
- Verify React Router installed: `npm list react-router-dom`
- Check console for routing errors

---

## Technologies Used

- **React Flow**: Drag-and-drop canvas framework
- **React Router**: Client-side routing
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling
- **Supabase/PostgreSQL**: Database storage
- **Express.js**: Backend API

---

## Questions?

The dashboard is fully functional and ready to use. You can:
1. Click on any client to see the new dashboard
2. Add/remove/drag widgets
3. Save your layout
4. Switch between Dashboard and Client Info tabs
5. Navigate back to the clients list

Everything is persisted to the database, so your dashboard layouts will be saved!
