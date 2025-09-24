import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/common.module.css';

const Layout = ({ children, title, subtitle }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home', exact: true },
    { path: '/upload-collaborative-documentation', label: 'Upload' }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    if (pathSegments.length > 0) {
      const currentItem = navigationItems.find(item => 
        item.path === location.pathname
      );
      if (currentItem && currentItem.path !== '/') {
        breadcrumbs.push({ label: currentItem.label, path: currentItem.path });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className={styles.page}>
      {/* Header Navigation */}
      <header style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderBottom: 'var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)'
      }}>
        <div className={styles.container}>
          <nav className={styles.nav} style={{ borderBottom: 'none', marginBottom: 0 }}>
            <div style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              marginRight: 'var(--spacing-lg)'
            }}>
              Project Collaboration Portal
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${
                    isActiveRoute(item.path, item.exact) ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.container}>
        <div className={styles.pageContent}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumb}>
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                <Link to={crumb.path} className={styles.navLink}>
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Page Header */}
          {(title || subtitle) && (
            <div className={styles.pageHeader}>
              {title && <h1 className={styles.pageTitle}>{title}</h1>}
              {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        borderTop: 'var(--border)',
        marginTop: 'auto',
        padding: 'var(--spacing-lg) 0'
      }}>
        <div className={styles.container}>
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            © 2025 Project Collaboration Portal. Built with React.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;