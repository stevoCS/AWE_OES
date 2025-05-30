import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const TestNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [renderCount, setRenderCount] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());

  // Force re-render on every navigation
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setTimestamp(Date.now());
    console.log('TestNavigation rendered at:', new Date().toLocaleTimeString());
  }, [location.pathname]);

  const testNavigate = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const forceRefresh = () => {
    window.location.reload();
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Cleared all cache');
    alert('Cache cleared! Page will refresh.');
    window.location.reload();
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: "'Space Grotesk', Arial, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1>Navigation Test Page</h1>
      
      {/* Debug Info */}
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #1976d2'
      }}>
        <h2>🐛 Debug Information</h2>
        <p><strong>Current Path:</strong> {location.pathname}</p>
        <p><strong>Render Count:</strong> {renderCount}</p>
        <p><strong>Last Rendered:</strong> {new Date(timestamp).toLocaleTimeString()}</p>
        <p><strong>React Router Working:</strong> ✅</p>
        <div style={{ marginTop: '15px' }}>
          <button onClick={forceRefresh} style={{ 
            padding: '10px 15px', 
            marginRight: '10px',
            backgroundColor: '#ff9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Force Page Refresh
          </button>
          <button onClick={clearCache} style={{ 
            padding: '10px 15px',
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Clear Cache & Refresh
          </button>
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Using Link Components:</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Home</Link>
          <Link to="/product" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Products</Link>
          <Link to="/product/1" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Product Detail 1</Link>
          <Link to="/new-arrivals" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>New Arrivals</Link>
          <Link to="/best-sellers" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Best Sellers</Link>
          <Link to="/login" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Login</Link>
          <Link to="/register" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Register</Link>
          <Link to="/cart" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Cart</Link>
          <Link to="/dashboard" style={{ color: '#0D80F2', textDecoration: 'none', padding: '10px', border: '1px solid #0D80F2', borderRadius: '4px', textAlign: 'center' }}>Dashboard</Link>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Using useNavigate Hook:</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button onClick={() => testNavigate('/')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Home</button>
          <button onClick={() => testNavigate('/product')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Products</button>
          <button onClick={() => testNavigate('/product/2')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Product Detail 2</button>
          <button onClick={() => testNavigate('/login')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Login</button>
          <button onClick={() => testNavigate('/cart')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Cart</button>
          <button onClick={() => testNavigate('/dashboard')} style={{ padding: '10px', border: '1px solid #16a34a', borderRadius: '4px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}>Dashboard</button>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px'
      }}>
        <h2>System Information:</h2>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Pathname:</strong> {window.location.pathname}</p>
        <p><strong>Search:</strong> {window.location.search}</p>
        <p><strong>Hash:</strong> {window.location.hash}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Date:</strong> {new Date().toString()}</p>
        
        <h3>Console Output:</h3>
        <p>Check browser console for navigation logs when using buttons above.</p>
        
        <h3>Troubleshooting:</h3>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>如果URL变化但页面不更新，点击"Force Page Refresh"</li>
          <li>如果问题持续，点击"Clear Cache & Refresh"</li>
          <li>检查浏览器控制台是否有错误信息</li>
          <li>确保JavaScript已启用</li>
          <li>尝试硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）</li>
        </ol>
      </div>
    </div>
  );
};

export default TestNavigation; 