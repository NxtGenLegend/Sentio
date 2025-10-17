import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, LayoutGrid } from 'lucide-react';
import { widgetTypes } from '../../components/dashboard/AssetWidgets';

// Custom node components
const nodeTypes = widgetTypes;

const ClientDashboard = ({ clientId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [nextId, setNextId] = useState(1);

  // Load dashboard from database
  useEffect(() => {
    loadDashboard();
  }, [clientId]);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/dashboard/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.layout) {
          setNodes(data.layout.nodes || []);
          setEdges(data.layout.edges || []);
          setNextId((data.layout.nodes?.length || 0) + 1);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const saveDashboard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/dashboard/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout: { nodes, edges }
        })
      });

      if (response.ok) {
        alert('Dashboard saved successfully!');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Failed to save dashboard');
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addWidget = useCallback((widgetType, defaultData = {}) => {
    const newNode = {
      id: `${widgetType}-${nextId}`,
      type: widgetType,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        ...defaultData,
        label: defaultData.label || `${widgetType} ${nextId}`,
        onRemove: () => removeWidget(`${widgetType}-${nextId}`),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNextId((id) => id + 1);
    setShowWidgetMenu(false);
  }, [nextId, setNodes]);

  const removeWidget = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const widgetTemplates = [
    {
      type: 'stock',
      label: 'Stock Position',
      icon: '📈',
      defaultData: {
        ticker: 'AAPL',
        shares: 100,
        price: 150.25,
        value: 15025,
        change: 2.5,
      }
    },
    {
      type: 'bond',
      label: 'Bond Position',
      icon: '💵',
      defaultData: {
        issuer: 'US Treasury',
        faceValue: 10000,
        couponRate: 4.5,
        maturityDate: '2030-12-31',
        yield: 4.2,
        marketValue: 10500,
      }
    },
    {
      type: 'realEstate',
      label: 'Real Estate',
      icon: '🏠',
      defaultData: {
        propertyName: 'Downtown Office',
        location: 'New York, NY',
        purchasePrice: 2000000,
        currentValue: 2500000,
        annualIncome: 150000,
        roi: 7.5,
      }
    },
    {
      type: 'privateEquity',
      label: 'Private Equity',
      icon: '💼',
      defaultData: {
        fundName: 'Tech Ventures Fund III',
        investment: 500000,
        currentValue: 750000,
        irr: 15.5,
        vintage: 2020,
      }
    },
    {
      type: 'crypto',
      label: 'Crypto Asset',
      icon: '₿',
      defaultData: {
        asset: 'Bitcoin',
        amount: 0.5,
        price: 45000,
        value: 22500,
        change: 3.2,
      }
    },
    {
      type: 'portfolioSummary',
      label: 'Portfolio Summary',
      icon: '📊',
      defaultData: {
        totalValue: 5000000,
        stocks: 2000000,
        bonds: 1000000,
        realEstate: 1500000,
        other: 500000,
      }
    },
    {
      type: 'alternative',
      label: 'Alternative Investment',
      icon: '🏢',
      defaultData: {
        assetType: 'Art Collection',
        description: 'Contemporary Art Portfolio',
        investment: 300000,
        currentValue: 425000,
      }
    },
  ];

  return (
    <div className="h-full w-full relative">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setShowWidgetMenu(!showWidgetMenu)}
          className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border-2 border-gray-200"
        >
          <Plus className="w-5 h-5" />
          Add Widget
        </button>

        <button
          onClick={saveDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Layout
        </button>

        <button
          onClick={() => {
            setNodes([]);
            setEdges([]);
          }}
          className="bg-gray-100 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-200 transition-all flex items-center gap-2 border-2 border-gray-200"
        >
          <LayoutGrid className="w-5 h-5" />
          Clear All
        </button>
      </div>

      {/* Widget Menu */}
      {showWidgetMenu && (
        <div className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 w-80">
          <h3 className="font-semibold text-lg mb-3">Add Widget</h3>
          <div className="grid grid-cols-2 gap-2">
            {widgetTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => addWidget(template.type, template.defaultData)}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-1">{template.icon}</div>
                <div className="text-sm font-medium">{template.label}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWidgetMenu(false)}
            className="mt-3 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-old-money-cream"
      >
        <Background color="#ddd" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              stock: '#3b82f6',
              bond: '#10b981',
              realEstate: '#f97316',
              privateEquity: '#a855f7',
              crypto: '#eab308',
              portfolioSummary: '#6366f1',
              alternative: '#14b8a6',
            };
            return colors[node.type] || '#gray';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default ClientDashboard;
