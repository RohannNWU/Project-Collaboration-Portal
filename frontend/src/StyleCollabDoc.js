import React from 'react';

const StyleCollabDoc = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Style Guide - Collaborative Documentation</h1>
      <nav style={{ marginBottom: '20px' }}>
        <a href="/" style={{ marginRight: '15px', color: '#007bff', textDecoration: 'none' }}>← Back to Home</a>
      </nav>
      
      <div style={{ maxWidth: '800px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>Color Palette</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#007bff', borderRadius: '8px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '12px' }}>Primary<br/>#007bff</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#28a745', borderRadius: '8px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '12px' }}>Success<br/>#28a745</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#dc3545', borderRadius: '8px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '12px' }}>Danger<br/>#dc3545</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ffc107', borderRadius: '8px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '12px' }}>Warning<br/>#ffc107</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Typography</h2>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Heading 1 - Main Title</h1>
            <h2 style={{ margin: '0 0 10px 0' }}>Heading 2 - Section Title</h2>
            <h3 style={{ margin: '0 0 10px 0' }}>Heading 3 - Subsection</h3>
            <p style={{ margin: '0 0 10px 0' }}>Regular paragraph text for content and descriptions.</p>
            <small>Small text for captions and footnotes.</small>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Buttons</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Primary Button
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Success Button
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Danger Button
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: 'transparent', 
              color: '#007bff', 
              border: '1px solid #007bff', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Outline Button
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Cards</h2>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px', 
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginTop: 0 }}>Card Title</h3>
            <p>This is an example of a card component used throughout the application for displaying content in organized sections.</p>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Card Action
            </button>
          </div>
        </section>

        <section>
          <h2>Spacing Guidelines</h2>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <ul>
              <li><strong>Small spacing:</strong> 8px - For tight elements</li>
              <li><strong>Medium spacing:</strong> 16px - For related elements</li>
              <li><strong>Large spacing:</strong> 24px - For section separation</li>
              <li><strong>Extra large spacing:</strong> 32px+ - For major sections</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleCollabDoc;
