import React from 'react';

const AppCollabDoc = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>App Overview - Collaborative Documentation</h1>
      <nav style={{ marginBottom: '20px' }}>
        <a href="/" style={{ marginRight: '15px', color: '#007bff', textDecoration: 'none' }}>← Back to Home</a>
      </nav>
      
      <div style={{ maxWidth: '900px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>Project Collaboration Portal</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#666' }}>
            A comprehensive platform designed to facilitate seamless collaboration among team members, 
            enabling efficient document sharing, task management, and project coordination.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#007bff', marginTop: 0 }}>📄 Document Management</h3>
              <p>Upload, organize, and collaborate on documents in real-time with version control and commenting features.</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#28a745', marginTop: 0 }}>✅ Task Management</h3>
              <p>Create, assign, and track tasks with priority levels, status updates, and team collaboration.</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#ffc107', marginTop: 0 }}>📊 Dashboard Analytics</h3>
              <p>Monitor project progress, team activity, and document statistics through comprehensive dashboards.</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#dc3545', marginTop: 0 }}>🎨 Style Consistency</h3>
              <p>Maintain consistent design and branding across all documentation with built-in style guides.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Technology Stack</h2>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ color: '#007bff', marginBottom: '10px' }}>Frontend</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>React.js</li>
                  <li>React Router</li>
                  <li>CSS Modules</li>
                  <li>Modern ES6+</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#28a745', marginBottom: '10px' }}>Backend</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Node.js</li>
                  <li>Express.js</li>
                  <li>RESTful APIs</li>
                  <li>Authentication</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#ffc107', marginBottom: '10px' }}>Database</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>MongoDB</li>
                  <li>Document Storage</li>
                  <li>User Management</li>
                  <li>File Metadata</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Application Architecture</h2>
          <div style={{ padding: '20px', border: '2px dashed #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '5px',
                margin: '5px'
              }}>
                React Frontend
              </div>
            </div>
            <div style={{ fontSize: '24px', margin: '10px 0' }}>↕</div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                borderRadius: '5px',
                margin: '5px'
              }}>
                Express.js API
              </div>
            </div>
            <div style={{ fontSize: '24px', margin: '10px 0' }}>↕</div>
            <div>
              <div style={{ 
                display: 'inline-block', 
                padding: '10px 20px', 
                backgroundColor: '#ffc107', 
                color: 'white', 
                borderRadius: '5px',
                margin: '5px'
              }}>
                MongoDB Database
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>Getting Started</h2>
          <div style={{ padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Navigate through the portal using the main navigation</li>
              <li>Upload your first document using the Upload feature</li>
              <li>Create tasks and assign them to team members</li>
              <li>Use the dashboard to monitor progress and activity</li>
              <li>Refer to the style guide for consistent formatting</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppCollabDoc;
