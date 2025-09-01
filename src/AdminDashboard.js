import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserEdit, 
  FaBook, 
  FaHeart, 
  FaEye, 
  FaChartLine, 
  FaDownload,
  FaLanguage,
  FaTags,
  FaCalendarAlt,
  FaTrophy,
  FaStar
} from 'react-icons/fa';
import config from './config';
import getResponsiveStyles from './utils/responsiveStyles';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalReaders: 0,
    totalAuthors: 0,
    totalBooks: 0,
    totalReads: 0,
    totalFavorites: 0,
    topBooks: [],
    topAuthors: [],
    genreDistribution: [],
    languageDistribution: [],
    recentActivity: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [styles, setStyles] = useState(getResponsiveStyles());

  // Update styles when window is resized
  useEffect(() => {
    const handleResize = () => {
      setStyles(getResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin-login');
      return;
    }
    
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/api/admin/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchAnalytics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content" style={{
          maxWidth: styles.containerWidth.xl,
          padding: `0 ${styles.spacing.lg}`,
        }}>
          <h1 style={{
            fontSize: styles.fontSize['2xl'],
            margin: 0,
          }}>PenX Admin Dashboard</h1>
          <div className="admin-actions" style={{
            flexDirection: styles.width < styles.breakpoints.medium ? 'column' : 'row',
            gap: styles.spacing.base,
          }}>
            <button onClick={fetchAnalytics} className="refresh-btn">
              <FaChartLine /> Refresh Data
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-content" style={{
        maxWidth: styles.containerWidth.xl,
        padding: styles.spacing.lg,
      }}>
        {/* Key Metrics */}
        <section className="metrics-section" style={{
          marginBottom: styles.spacing.xl,
        }}>
          <h2 style={{
            fontSize: styles.fontSize.xl,
            marginBottom: styles.spacing.lg,
            textAlign: 'center',
          }}>Key Metrics</h2>
          <div className="metrics-grid" style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${styles.width < styles.breakpoints.medium ? '280px' : '300px'}, 1fr))`,
            gap: styles.spacing.lg,
          }}>
            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Total Readers</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>{analytics.totalReaders}</p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>Registered users</p>
              </div>
            </div>

            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaUserEdit />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Total Authors</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>{analytics.totalAuthors}</p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>Content creators</p>
              </div>
            </div>

            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaBook />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Total Books</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>{analytics.totalBooks}</p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>Published works</p>
              </div>
            </div>

            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaEye />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Total Reads</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>{analytics.totalReads}</p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>Book interactions</p>
              </div>
            </div>

            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaHeart />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Total Favorites</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>{analytics.totalFavorites}</p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>User favorites</p>
              </div>
            </div>

            <div className="metric-card" style={{
              padding: styles.spacing.lg,
            }}>
              <div className="metric-icon">
                <FaDownload />
              </div>
              <div className="metric-content">
                <h3 style={{
                  fontSize: styles.fontSize.base,
                }}>Engagement Rate</h3>
                <p className="metric-value" style={{
                  fontSize: styles.fontSize['2xl'],
                }}>
                  {analytics.totalReaders > 0 
                    ? Math.round((analytics.totalReads / analytics.totalReaders) * 100) 
                    : 0}%
                </p>
                <p className="metric-label" style={{
                  fontSize: styles.fontSize.sm,
                }}>Reads per reader</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Content */}
        <section className="content-section" style={{
          marginBottom: styles.spacing.xl,
        }}>
          <div className="content-grid" style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${styles.width < styles.breakpoints.medium ? '350px' : '400px'}, 1fr))`,
            gap: styles.spacing.lg,
          }}>
            <div className="content-card" style={{
              padding: styles.spacing.lg,
            }}>
              <h3 style={{
                fontSize: styles.fontSize.lg,
                marginBottom: styles.spacing.lg,
              }}><FaTrophy /> Top Books</h3>
              <div className="content-list" style={{
                gap: styles.spacing.base,
              }}>
                {analytics.topBooks.map((book, index) => (
                  <div key={book.id} className="content-item">
                    <div className="content-rank">{index + 1}</div>
                    <div className="content-info">
                      <h4>{book.title}</h4>
                      <p>by {book.author}</p>
                      <div className="content-stats">
                        <span><FaEye /> {book.reads}</span>
                        <span><FaHeart /> {book.favorites}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-card" style={{
              padding: styles.spacing.lg,
            }}>
              <h3 style={{
                fontSize: styles.fontSize.lg,
                marginBottom: styles.spacing.lg,
              }}><FaStar /> Top Authors</h3>
              <div className="content-list" style={{
                gap: styles.spacing.base,
              }}>
                {analytics.topAuthors.map((author, index) => (
                  <div key={author.name} className="content-item">
                    <div className="content-rank">{index + 1}</div>
                    <div className="content-info">
                      <h4>{author.name}</h4>
                      <p>{author.publications} publications</p>
                      <div className="content-stats">
                        <span><FaBook /> {author.publications}</span>
                        <span><FaEye /> {author.totalReads}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Distribution Charts */}
        <section className="distribution-section" style={{
          marginBottom: styles.spacing.xl,
        }}>
          <div className="distribution-grid" style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${styles.width < styles.breakpoints.medium ? '350px' : '400px'}, 1fr))`,
            gap: styles.spacing.lg,
          }}>
            <div className="distribution-card" style={{
              padding: styles.spacing.lg,
            }}>
              <h3 style={{
                fontSize: styles.fontSize.lg,
                marginBottom: styles.spacing.lg,
              }}><FaLanguage /> Language Distribution</h3>
              <div className="distribution-list" style={{
                gap: styles.spacing.base,
              }}>
                {analytics.languageDistribution.map((lang) => (
                  <div key={lang.language} className="distribution-item">
                    <div className="distribution-label">{lang.language}</div>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill" 
                        style={{ width: `${(lang.count / analytics.totalBooks) * 100}%` }}
                      ></div>
                    </div>
                    <div className="distribution-count">{lang.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-card" style={{
              padding: styles.spacing.lg,
            }}>
              <h3 style={{
                fontSize: styles.fontSize.lg,
                marginBottom: styles.spacing.lg,
              }}><FaTags /> Genre Distribution</h3>
              <div className="distribution-list" style={{
                gap: styles.spacing.base,
              }}>
                {analytics.genreDistribution.slice(0, 10).map((genre) => (
                  <div key={genre.genre} className="distribution-item">
                    <div className="distribution-label">{genre.genre}</div>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill" 
                        style={{ width: `${(genre.count / analytics.totalBooks) * 100}%` }}
                      ></div>
                    </div>
                    <div className="distribution-count">{genre.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section" style={{
          padding: styles.spacing.lg,
        }}>
          <h3 style={{
            fontSize: styles.fontSize.lg,
            marginBottom: styles.spacing.lg,
          }}><FaCalendarAlt /> Recent Activity</h3>
          <div className="activity-list" style={{
            gap: styles.spacing.base,
          }}>
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'read' && <FaEye />}
                  {activity.type === 'favorite' && <FaHeart />}
                  {activity.type === 'book' && <FaBook />}
                  {activity.type === 'user' && <FaUsers />}
                </div>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard; 