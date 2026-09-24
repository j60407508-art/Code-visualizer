// import React, { useState, useEffect, useCallback } from 'react';
// import Editor from '@monaco-editor/react';
// import { ReactFlow, Background, Controls } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// function App() {
//   const [code, setCode] = useState(`// Type your LLD Code below to see smart relationships!

// public class OrderController {
//     private OrderService orderService; 
// }

// class OrderService implements NotificationService {
//     private OrderRepository db; 
    
//     public void notifyUser() {}
// }

// interface NotificationService {
//     void notifyUser();
// }

// class OrderRepository {
//     // Database access layer
// }`);

//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [syncStatus, setSyncStatus] = useState('Synced'); // Tracks syncing states: 'Typing...', 'Syncing...', 'Synced'

//   const getNodeColor = (type) => {
//     switch (type) {
//       case 'Controller': return '#e1f5fe';
//       case 'Service': return '#e8f5e9';
//       case 'DatabaseLayer': return '#fff3e0';
//       case 'Interface': return '#f3e5f5';
//       default: return '#ffffff';
//     }
//   };

//   // The analysis logic converted into a reusable callback function
//   const handleAnalyze = useCallback(async (currentCode) => {
//     setSyncStatus('Syncing...');
//     try {
//       const response = await fetch('http://localhost:8080/api/parser/analyze', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code: currentCode }),
//       });
      
//       const data = await response.json();
//       if (data.error) return; // Keep rendering older stable canvas if student has a temporary syntax error while typing

//       // Generate Nodes
//       const generatedNodes = data.nodes.map((component, index) => {
//         // Build badges array for UI rendering based on pattern status flags from backend
//         const badges = [];
//         if (component.isSingleton) badges.push('Singleton');
//         if (component.isFactory) badges.push('Factory Pattern');

//         return {
//           id: component.name,
//           data: { 
//             label: (
//               <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
//                 <small style={{ fontSize: '10px', color: '#777', display: 'block' }}>
//                   «{component.type}»
//                 </small>
//                 <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{component.name}</div>
                
//                 {/* Dynamically display design pattern badges if found */}
//                 {badges.map(badge => (
//                   <span key={badge} style={{ display: 'inline-block', background: '#d32f2f', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', marginTop: '6px', fontWeight: 'bold', marginRight: '2px' }}>
//                     {badge}
//                   </span>
//                 ))}
//               </div>
//             ) 
//           },
//           position: { x: (index % 2) * 250 + 50, y: Math.floor(index / 2) * 150 + 50 }, 
//           style: {
//             background: badges.length > 0 ? '#ffebee' : getNodeColor(component.type), // Highlight patterns with light reddish background
//             border: badges.length > 0 ? '2px solid #d32f2f' : '1.5px solid #222',
//             borderRadius: '8px',
//             padding: '12px 24px',
//             boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
//             minWidth: 160,
//             width: 'max-content',
//             whiteSpace: 'nowrap'
//           }
//         };
//       });

//       // Map Smart Edges
//       const generatedEdges = data.edges.map((edgeData, index) => {
//         const isDependency = edgeData.relationType === 'dependency';
//         return {
//           id: `e-${index}-${edgeData.source}-${edgeData.target}`,
//           source: edgeData.source,
//           target: edgeData.target,
//           animated: isDependency,
//           label: edgeData.relationType,
//           style: { 
//             stroke: isDependency ? '#1e88e5' : '#7b1fa2', 
//             strokeWidth: 2 
//           },
//           labelStyle: { fill: '#333', fontSize: '10px', fontWeight: '500' }
//         };
//       });

//       setNodes(generatedNodes);
//       setEdges(generatedEdges);
//       setSyncStatus('Synced');

//     } catch (error) {
//       console.error("Error auto-updating blueprint:", error);
//     }
//   }, []);

//   // Debounce Engine Hook: Runs 1.5 seconds after code stops changing
//   useEffect(() => {
//     setSyncStatus('Typing...');
//     const delayDebounceTimer = setTimeout(() => {
//       handleAnalyze(code);
//     }, 1500);

//     return () => clearTimeout(delayDebounceTimer);
//   }, [code, handleAnalyze]);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
//       {/* Top Navbar */}
//       <div style={{ padding: '12px 20px', background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.5px' }}>LLD Live Blueprint Visualizer 🚀</h2>
        
//         {/* Status Indicator Bar replacing the old button */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ 
//             width: '10px', height: '10px', borderRadius: '50%', 
//             background: syncStatus === 'Synced' ? '#4caf50' : syncStatus === 'Syncing...' ? '#ffeb3b' : '#ff9800',
//             display: 'inline-block'
//           }}></span>
//           <span style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>{syncStatus}</span>
//         </div>
//       </div>

//       <div style={{ display: 'flex', flex: 1 }}>
//         <div style={{ width: '45%', borderRight: '2px solid #ddd' }}>
//           <Editor
//             height="100%"
//             defaultLanguage="java"
//             theme="vs-dark"
//             value={code}
//             onChange={(value) => setCode(value || '')}
//             options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
//           />
//         </div>

//         <div style={{ width: '55%', background: '#f8fafc', position: 'relative' }}>
//           {nodes.length === 0 ? (
//             <div style={{ position: 'absolute', top: '45%', left: '35%', color: '#94a3b8', textAlign: 'center' }}>
//               <h3>Initializing Architecture Map...</h3>
//             </div>
//           ) : (
//             <ReactFlow nodes={nodes} edges={edges} fitView>
//               <Background color="#cbd5e1" gap={18} size={1.5} />
//               <Controls />
//             </ReactFlow>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .app-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    font-family: sans-serif;
  }

  .navbar {
    padding: 12px 20px;
    background: #111;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .navbar h2 {
    margin: 0;
    font-size: 18px;
    letter-spacing: 0.5px;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  .status-label {
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
  }

  .main-panels {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* ── Editor panel ── */
  .panel-editor {
    width: 45%;
    border-right: 2px solid #ddd;
    overflow: hidden;
  }

  /* ── Visual panel ── */
  .panel-visual {
    width: 55%;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #94a3b8;
    text-align: center;
    pointer-events: none;
  }

  /* ── Responsive: stack vertically on narrow screens ── */
  @media (max-width: 768px) {
    .navbar h2 {
      font-size: 14px;
    }

    .main-panels {
      flex-direction: column;
    }

    .panel-editor {
      width: 100%;
      height: 50%;          /* exactly half the remaining viewport */
      border-right: none;
      border-bottom: 2px solid #ddd;
    }

    .panel-visual {
      width: 100%;
      height: 50%;
    }
  }
`;

function App() {
  const [code, setCode] = useState(`// Type your LLD Code below to see smart relationships!

public class OrderController {
    private OrderService orderService; 
}

class OrderService implements NotificationService {
    private OrderRepository db; 
    
    public void notifyUser() {}
}

interface NotificationService {
    void notifyUser();
}

class OrderRepository {
    // Database access layer
}`);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [syncStatus, setSyncStatus] = useState('Synced');

  const getNodeColor = (type) => {
    switch (type) {
      case 'Controller':    return '#e1f5fe';
      case 'Service':       return '#e8f5e9';
      case 'DatabaseLayer': return '#fff3e0';
      case 'Interface':     return '#f3e5f5';
      default:              return '#ffffff';
    }
  };

  const handleAnalyze = useCallback(async (currentCode) => {
    setSyncStatus('Syncing...');
    try {
      const response = await fetch('http://localhost:8080/api/parser/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode }),
      });

      const data = await response.json();
      if (data.error) return;

      const generatedNodes = data.nodes.map((component, index) => {
        const badges = [];
        if (component.isSingleton)  badges.push('Singleton');
        if (component.isFactory)    badges.push('Factory Pattern');

        return {
          id: component.name,
          data: {
            label: (
              <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                <small style={{ fontSize: '10px', color: '#777', display: 'block' }}>
                  «{component.type}»
                </small>
                <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{component.name}</div>
                {badges.map(badge => (
                  <span
                    key={badge}
                    style={{
                      display: 'inline-block', background: '#d32f2f', color: 'white',
                      fontSize: '9px', padding: '2px 6px', borderRadius: '10px',
                      marginTop: '6px', fontWeight: 'bold', marginRight: '2px',
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ),
          },
          position: { x: (index % 2) * 250 + 50, y: Math.floor(index / 2) * 150 + 50 },
          style: {
            background: badges.length > 0 ? '#ffebee' : getNodeColor(component.type),
            border: badges.length > 0 ? '2px solid #d32f2f' : '1.5px solid #222',
            borderRadius: '8px',
            padding: '12px 24px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            minWidth: 160,
            width: 'max-content',
            whiteSpace: 'nowrap',
          },
        };
      });

      const generatedEdges = data.edges.map((edgeData, index) => {
        const isDependency = edgeData.relationType === 'dependency';
        return {
          id: `e-${index}-${edgeData.source}-${edgeData.target}`,
          source: edgeData.source,
          target: edgeData.target,
          animated: isDependency,
          label: edgeData.relationType,
          style: { stroke: isDependency ? '#1e88e5' : '#7b1fa2', strokeWidth: 2 },
          labelStyle: { fill: '#333', fontSize: '10px', fontWeight: '500' },
        };
      });

      setNodes(generatedNodes);
      setEdges(generatedEdges);
      setSyncStatus('Synced');
    } catch (error) {
      console.error('Error auto-updating blueprint:', error);
    }
  }, []);

  useEffect(() => {
    setSyncStatus('Typing...');
    const timer = setTimeout(() => handleAnalyze(code), 1500);
    return () => clearTimeout(timer);
  }, [code, handleAnalyze]);

  const dotColor =
    syncStatus === 'Synced'     ? '#4caf50' :
    syncStatus === 'Syncing...' ? '#ffeb3b' : '#ff9800';

  return (
    <>
      <style>{styles}</style>

      <div className="app-wrapper">
        {/* Navbar */}
        <div className="navbar">
          <h2>LLD Live Blueprint Visualizer 🚀</h2>
          <div className="status-bar">
            <span className="status-dot" style={{ background: dotColor }} />
            <span className="status-label">{syncStatus}</span>
          </div>
        </div>

        {/* Main split panels */}
        <div className="main-panels">
          {/* Left / top: code editor */}
          <div className="panel-editor">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
            />
          </div>

          {/* Right / bottom: visual board */}
          <div className="panel-visual">
            {nodes.length === 0 ? (
              <div className="empty-state">
                <h3>Initializing Architecture Map…</h3>
              </div>
            ) : (
              <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background color="#cbd5e1" gap={18} size={1.5} />
                <Controls />
              </ReactFlow>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;