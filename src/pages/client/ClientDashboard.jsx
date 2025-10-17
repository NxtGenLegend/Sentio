import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, LayoutGrid, Sparkles, Grid3x3, Maximize2 } from 'lucide-react';
import { widgetTypes } from '../../components/dashboard/AssetWidgets';

// Custom node components
const nodeTypes = widgetTypes;

const ClientDashboard = ({ clientId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/dashboard/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout: { nodes, edges }
        })
      });

      if (response.ok) {
        alert('✅ Dashboard saved successfully!');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('❌ Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const autoLayout = useCallback(() => {
    const padding = 50;
    const cardWidth = 320;
    const cardHeight = 250;
    const cols = 3;

    const layoutedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...node,
        position: {
          x: padding + col * (cardWidth + padding),
          y: padding + row * (cardHeight + padding),
        },
      };
    });

    setNodes(layoutedNodes);
  }, [nodes, setNodes]);

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
    <div className="h-full w-full relative bg-gradient-to-br from-old-money-cream via-old-money-cream to-old-money-cream/80">
      {/* Enhanced Top Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-3">
        <button
          onClick={() => setShowWidgetMenu(!showWidgetMenu)}
          className="bg-gradient-to-r from-old-money-navy to-old-money-navy/90 text-old-money-cream px-4 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 border border-old-money-cream/20 hover:scale-105 transform"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Asset</span>
        </button>

        <button
          onClick={saveDashboard}
          disabled={isSaving}
          className="bg-gradient-to-r from-old-money-gold to-old-money-gold/90 text-old-money-navy px-4 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span className="font-semibold">{isSaving ? 'Saving...' : 'Save Layout'}</span>
        </button>

        <button
          onClick={autoLayout}
          className="bg-white text-old-money-navy px-4 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 border border-old-money-navy/20 hover:scale-105 transform"
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="font-semibold">Auto Layout</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Clear all widgets? This cannot be undone.')) {
              setNodes([]);
              setEdges([]);
            }
          }}
          className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 border border-red-200 hover:bg-red-100 hover:scale-105 transform"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="font-semibold">Clear All</span>
        </button>
      </div>

      {/* Info Panel */}
      {nodes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-old-money-navy/10">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-old-money-gold animate-pulse" />
            <h3 className="text-2xl font-bold text-old-money-navy mb-2 font-serif">
              Build Your Portfolio Dashboard
            </h3>
            <p className="text-old-money-navy/70 mb-4">
              Click "Add Asset" to start adding widgets to your dashboard
            </p>
            <div className="flex gap-2 justify-center">
              <div className="px-3 py-1 bg-old-money-navy/10 rounded-full text-sm text-old-money-navy">
                Drag to move
              </div>
              <div className="px-3 py-1 bg-old-money-navy/10 rounded-full text-sm text-old-money-navy">
                Connect widgets
              </div>
              <div className="px-3 py-1 bg-old-money-navy/10 rounded-full text-sm text-old-money-navy">
                Auto-organize
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Widget Menu */}
      {showWidgetMenu && (
        <div className="absolute top-24 left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-old-money-navy/20 p-6 w-96 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-bold text-old-money-navy">Add Asset Widget</h3>
            <button
              onClick={() => setShowWidgetMenu(false)}
              className="text-old-money-navy/60 hover:text-old-money-navy transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {widgetTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => addWidget(template.type, template.defaultData)}
                className="p-4 border-2 border-old-money-navy/10 rounded-xl hover:border-old-money-gold hover:bg-old-money-gold/10 transition-all duration-200 text-left group hover:scale-105 transform shadow-sm hover:shadow-md"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {template.icon}
                </div>
                <div className="text-sm font-semibold text-old-money-navy">
                  {template.label}
                </div>
              </button>
            ))}
          </div>
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
        className="bg-transparent"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#C5A572', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#C5A572', strokeWidth: 2 }}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background
          color="#1a3a52"
          gap={20}
          size={1}
          style={{ opacity: 0.1 }}
          variant="dots"
        />
        <Controls
          className="bg-white/90 backdrop-blur-sm border border-old-money-navy/20 rounded-xl shadow-lg"
          style={{ button: { backgroundColor: 'white' } }}
        />
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
            return colors[node.type] || '#C5A572';
          }}
          className="bg-white/90 backdrop-blur-sm border border-old-money-navy/20 rounded-xl shadow-lg"
          maskColor="rgba(26, 58, 82, 0.1)"
        />

        {/* Stats Panel */}
        {nodes.length > 0 && (
          <Panel position="top-right" className="m-4">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-old-money-navy/20 p-4 min-w-[200px]">
              <h4 className="font-serif font-bold text-old-money-navy mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-old-money-gold" />
                Dashboard Stats
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-old-money-navy/60">Total Widgets:</span>
                  <span className="font-semibold text-old-money-navy">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-old-money-navy/60">Connections:</span>
                  <span className="font-semibold text-old-money-navy">{edges.length}</span>
                </div>
                <div className="pt-2 border-t border-old-money-navy/10">
                  <div className="flex flex-wrap gap-1">
                    {nodes.slice(0, 5).map((node) => (
                      <div
                        key={node.id}
                        className="px-2 py-1 bg-old-money-navy/10 rounded text-xs text-old-money-navy"
                      >
                        {node.type}
                      </div>
                    ))}
                    {nodes.length > 5 && (
                      <div className="px-2 py-1 bg-old-money-gold/20 rounded text-xs text-old-money-navy font-semibold">
                        +{nodes.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default ClientDashboard;
