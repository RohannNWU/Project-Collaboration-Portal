import React, { useState } from 'react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('project-description');

  const tabs = [
    { 
      id: 'project-description', 
      label: 'Project Description', 
      content: (
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Project Description
          </h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
            This section contains detailed information about your current project. 
            You can view project objectives, requirements, deadlines, and other important details here.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore 
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </div>
      )
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      content: (
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Tasks
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 1: Project Planning and Research</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Completed</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: March 15, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 2: User Interface Design Mockups</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: In Progress</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: March 22, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 3: Database Schema Design</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: In Progress</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: March 20, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 4: Frontend Implementation</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 5, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 5: Backend API Development</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 12, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 6: User Authentication System</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 8, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 7: Data Validation and Security</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 15, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 8: Testing and Quality Assurance</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 18, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 9: Performance Optimization</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 20, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 10: Documentation and User Guide</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 22, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 11: Deployment and Production Setup</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 25, 2024</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Task 12: Final Review and Bug Fixes</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Status: Not Started</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Due: April 28, 2024</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      content: (
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Team Chat
          </h2>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.25rem', 
            border: '1px solid #d1d5db', 
            height: '16rem', 
            padding: '1rem', 
            overflowY: 'auto',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#3b82f6', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  A
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Alice</p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Hey team, how's the project coming along?</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  B
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Bob</p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Making good progress on the research tasks!</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#8b5cf6', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  C
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Carol</p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>The UI mockups are almost ready for review!</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.25rem', 
                outline: 'none',
                fontSize: '0.875rem'
              }}
            />
            <button style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              borderRadius: '0.25rem', 
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Send
            </button>
          </div>
        </div>
      )
    },
    { 
      id: 'members', 
      label: 'Members', 
      content: (
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Team Members
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'white', 
              borderRadius: '0.25rem', 
              border: '1px solid #d1d5db' 
            }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: '500',
                flexShrink: 0
              }}>
                A
              </div>
              <div>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Alice Johnson</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Project Lead</p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'white', 
              borderRadius: '0.25rem', 
              border: '1px solid #d1d5db' 
            }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#10b981', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: '500',
                flexShrink: 0
              }}>
                B
              </div>
              <div>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Bob Smith</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Developer</p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'white', 
              borderRadius: '0.25rem', 
              border: '1px solid #d1d5db' 
            }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#8b5cf6', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: '500',
                flexShrink: 0
              }}>
                C
              </div>
              <div>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>Carol Davis</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Designer</p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'white', 
              borderRadius: '0.25rem', 
              border: '1px solid #d1d5db' 
            }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#f59e0b', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: '500',
                flexShrink: 0
              }}>
                D
              </div>
              <div>
                <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>David Wilson</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>QA Tester</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ width: '80%', margin: '0 auto' }}>
        {/* Main Dashboard Container */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '0.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          overflow: 'hidden',
          border: '2px solid #374151'
        }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex' }}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRight: index < tabs.length - 1 ? '1px solid #4b5563' : 'none',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.id ? '#374151' : '#1f2937',
                  color: activeTab === tab.id ? 'white' : '#d1d5db',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#374151';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.color = '#d1d5db';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ 
            backgroundColor: '#9ca3af', 
            minHeight: '600px',
            color: '#1f2937'
          }}>
            {tabs.map((tab) => (
              activeTab === tab.id && (
                <div key={tab.id}>
                  {tab.content}
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;