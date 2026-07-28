'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, DollarSign, Users, CheckCircle, XCircle, 
  Trash2, Sparkles, LogOut, Check, X, Mail, Star, 
  Plus, Edit, ClipboardList, Settings, MessageSquare, AlertCircle
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import styles from './Dashboard.module.css';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  service: { name: string; basePrice: number };
  date: string;
  time: string;
  notes: string | null;
  status: string;
  totalCost: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  icon: string;
}

interface Testimonial {
  id: string;
  author: string;
  company: string | null;
  rating: number;
  text: string;
  approved: boolean;
}

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'testimonials' | 'messages'>('bookings');

  // Core Database States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Dashboard Action State
  const [dashboardError, setDashboardError] = useState('');
  const [rescheduleData, setRescheduleData] = useState<{ id: string; date: string; time: string } | null>(null);
  
  // Service Creator Form State
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    basePrice: 100,
    duration: '2 hours',
    icon: 'Sparkles',
  });

  // Verify Admin Session
  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.success) {
          router.push('/admin/login');
          return;
        }

        setAdmin(data.user);
        await loadAllData();
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router]);

  const loadAllData = async () => {
    try {
      const [bookingsRes, servicesRes, testimonialsRes, messagesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/services'),
        fetch('/api/testimonials'),
        fetch('/api/contact'),
      ]);

      const [bookingsData, servicesData, testimonialsData, messagesData] = await Promise.all([
        bookingsRes.json(),
        servicesRes.json(),
        testimonialsRes.json(),
        messagesRes.json(),
      ]);

      if (bookingsData.success) setBookings(bookingsData.bookings);
      if (servicesData.success) setServices(servicesData.services);
      if (testimonialsData.success) setTestimonials(testimonialsData.testimonials);
      if (messagesData.success) setMessages(messagesData.messages);
    } catch (e) {
      setDashboardError('Failed to fetch dashboard data fields.');
    }
  };

  // 1. Logout Action
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      setDashboardError('Logout failure.');
    }
  };

  // 2. Bookings Moderation
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: data.booking.status } : b));
      }
    } catch (e) {
      setDashboardError('Failed to update booking status.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData) return;

    try {
      const res = await fetch(`/api/bookings/${rescheduleData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleData.date, time: rescheduleData.time }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === rescheduleData.id ? { ...b, date: data.booking.date, time: data.booking.time } : b));
        setRescheduleData(null);
      }
    } catch (e) {
      setDashboardError('Failed to reschedule booking.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      setDashboardError('Delete booking failed.');
    }
  };

  // 3. Services Management
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => [...prev, data.service]);
        setIsCreatingService(false);
        setNewService({ name: '', description: '', basePrice: 100, duration: '2 hours', icon: 'Sparkles' });
      }
    } catch (e) {
      setDashboardError('Failed to add service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service? This will delete all associated booking relations.')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.filter(s => s.id !== id));
        // Refresh bookings since cascade deletion might have updated DB rows
        loadAllData();
      }
    } catch (e) {
      setDashboardError('Failed to delete service.');
    }
  };

  // 4. Testimonials Moderation
  const handleToggleTestimonial = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: data.testimonial.approved } : t));
      }
    } catch (e) {
      setDashboardError('Testimonial status update failure.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete review?')) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    } catch (e) {
      setDashboardError('Failed to delete review.');
    }
  };

  // 5. Messages Inbox
  const handleToggleMessageRead = async (id: string, read: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });
      if ((await res.json()).success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
      }
    } catch (e) {
      setDashboardError('Failed to update message.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete contact message?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      setDashboardError('Delete message failure.');
    }
  };

  // Dashboard Analytics Calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'APPROVED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Sparkles className={styles.logoIcon} />
          <h2>LuxeAdmin</h2>
        </div>
        <nav className={styles.navMenu}>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`${styles.navItem} ${activeTab === 'bookings' ? styles.activeItem : ''}`}
          >
            <ClipboardList size={18} /> Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`${styles.navItem} ${activeTab === 'services' ? styles.activeItem : ''}`}
          >
            <Settings size={18} /> Clean Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`${styles.navItem} ${activeTab === 'testimonials' ? styles.activeItem : ''}`}
          >
            <Star size={18} /> Reviews Moderation
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`${styles.navItem} ${activeTab === 'messages' ? styles.activeItem : ''}`}
          >
            <Mail size={18} /> Client Messages ({messages.filter(m => !m.read).length} new)
          </button>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <strong>{admin?.name}</strong>
            <span>{admin?.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {dashboardError && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{dashboardError}</span>
            <button onClick={() => setDashboardError('')} className={styles.closeAlertBtn}>&times;</button>
          </div>
        )}

        {/* Analytics Widgets Bar */}
        <section className={styles.analyticsBar}>
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <span>Estimated Revenue</span>
              <DollarSign size={20} className={styles.revIcon} />
            </div>
            <div className={styles.widgetValue}>${totalRevenue}</div>
            <div className={styles.widgetSub}>From approved/completed cleans</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <span>Active Bookings</span>
              <ClipboardList size={20} className={styles.bookIcon} />
            </div>
            <div className={styles.widgetValue}>{bookings.length}</div>
            <div className={styles.widgetSub}>All database bookings count</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <span>Pending Reviews</span>
              <AlertCircle size={20} className={styles.pendingIcon} />
            </div>
            <div className={styles.widgetValue}>{pendingBookings}</div>
            <div className={styles.widgetSub}>Appointments awaiting verification</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <span>CRO Conversion</span>
              <Users size={20} className={styles.convIcon} />
            </div>
            <div className={styles.widgetValue}>3.4%</div>
            <div className={styles.widgetSub}>Average conversion estimate</div>
          </div>
        </section>

        {/* TAB CONTENTS */}
        
        {/* TAB 1: Bookings List */}
        {activeTab === 'bookings' && (
          <section className={styles.tabContentCard}>
            <div className={styles.cardHeader}>
              <h3>Bookings List</h3>
              <p>Verify and manage schedule arrangements.</p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Clean Package</th>
                    <th>Date & Time</th>
                    <th>Total Base Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className={styles.boldName}>{booking.customerName}</div>
                        <div className={styles.subDetail}>{booking.customerEmail} | {booking.customerPhone}</div>
                        {booking.notes && (
                          <div className={styles.noteSnippet}>📝 {booking.notes}</div>
                        )}
                      </td>
                      <td>{booking.service?.name}</td>
                      <td>
                        <div className={styles.dateHolder}>
                          <Calendar size={12} /> {booking.date}
                        </div>
                        <div className={styles.timeHolder}>
                          <Clock size={12} /> {booking.time}
                        </div>
                      </td>
                      <td className={styles.boldCost}>${booking.totalCost}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionRow}>
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'APPROVED')}
                                className={styles.btnApprove}
                                title="Approve booking"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'REJECTED')}
                                className={styles.btnReject}
                                title="Reject booking"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {booking.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                              className={styles.btnComplete}
                              title="Mark as completed"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setRescheduleData({ id: booking.id, date: booking.date, time: booking.time })}
                            className={styles.btnReschedule}
                            title="Reschedule"
                          >
                            <Clock size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className={styles.btnDelete}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.noDataRow}>No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reschedule Overlay Popover Modal */}
            {rescheduleData && (
              <div className={styles.modalBackdrop}>
                <div className={`glass-card ${styles.modalCard}`}>
                  <h4>Reschedule Appointment</h4>
                  <form onSubmit={handleRescheduleSubmit}>
                    <div className="input-group">
                      <label className="input-label">Date Selection</label>
                      <input
                        type="date"
                        value={rescheduleData.date}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Time Selection</label>
                      <input
                        type="text"
                        value={rescheduleData.time}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                        className="input-field"
                        placeholder="e.g. 10:00"
                        required
                      />
                    </div>
                    <div className={styles.modalButtons}>
                      <button type="button" onClick={() => setRescheduleData(null)} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Confirm Reschedule
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Services Management */}
        {activeTab === 'services' && (
          <section className={styles.tabContentCard}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Clean Packages & Pricing</h3>
                  <p>Configure packages catalog and manage starting base price rates.</p>
                </div>
                <button onClick={() => setIsCreatingService(true)} className="btn btn-primary">
                  <Plus size={16} /> New Service
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Icon Class</th>
                    <th>Avg. Clean Duration</th>
                    <th>Base Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <strong>{service.name}</strong>
                        <div className={styles.subDetail}>{service.description}</div>
                      </td>
                      <td><code>{service.icon}</code></td>
                      <td>{service.duration}</td>
                      <td className={styles.boldCost}>${service.basePrice}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className={styles.btnDelete}
                          title="Delete Service"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Service Modal */}
            {isCreatingService && (
              <div className={styles.modalBackdrop}>
                <div className={`glass-card ${styles.modalCard}`}>
                  <h4>Add New Clean Service</h4>
                  <form onSubmit={handleCreateService}>
                    <div className="input-group">
                      <label className="input-label">Service Title Name</label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Package Description</label>
                      <textarea
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="input-field"
                        rows={3}
                        required
                      ></textarea>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Starting Base Price ($)</label>
                      <input
                        type="number"
                        value={newService.basePrice}
                        onChange={(e) => setNewService({ ...newService, basePrice: Number(e.target.value) })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Average Clean Duration</label>
                      <input
                        type="text"
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                        className="input-field"
                        placeholder="e.g. 3 hours"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Lucide Icon Class Identifier</label>
                      <select
                        value={newService.icon}
                        onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                        className="input-field"
                      >
                        <option value="Sparkles">Sparkles (Deep Clean)</option>
                        <option value="Home">Home (Regular)</option>
                        <option value="Key">Key (Lease)</option>
                        <option value="Briefcase">Briefcase (Office)</option>
                      </select>
                    </div>
                    <div className={styles.modalButtons}>
                      <button type="button" onClick={() => setIsCreatingService(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Add Package
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Testimonials Moderation */}
        {activeTab === 'testimonials' && (
          <section className={styles.tabContentCard}>
            <div className={styles.cardHeader}>
              <h3>Reviews Moderation</h3>
              <p>Approve reviews to display on client testimonies sections.</p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Review Author</th>
                    <th>Stars</th>
                    <th>Review Text</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.author}</strong>
                        <div className={styles.subDetail}>{t.company || 'Private Client'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px', color: 'var(--accent)' }}>
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} size={12} fill="var(--accent)" />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: '350px', fontSize: '0.85rem' }}>"{t.text}"</td>
                      <td>
                        <span className={`${styles.statusBadge} ${t.approved ? styles.approved : styles.pending}`}>
                          {t.approved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionRow}>
                          <button
                            onClick={() => handleToggleTestimonial(t.id, !t.approved)}
                            className={t.approved ? styles.btnReject : styles.btnApprove}
                            title={t.approved ? 'Unapprove review' : 'Approve review'}
                          >
                            {t.approved ? <X size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className={styles.btnDelete}
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {testimonials.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.noDataRow}>No testimonies submitted.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: Contact Messages Inbox */}
        {activeTab === 'messages' && (
          <section className={styles.tabContentCard}>
            <div className={styles.cardHeader}>
              <h3>Client Contact Inbox</h3>
              <p>Read messages sent through contact forms.</p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Contact Sender</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date Received</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className={!msg.read ? styles.unreadRow : ''}>
                      <td>
                        <strong>{msg.name}</strong>
                        <div className={styles.subDetail}>{msg.email}</div>
                      </td>
                      <td><strong>{msg.subject || 'General'}</strong></td>
                      <td style={{ maxWidth: '350px', fontSize: '0.85rem' }}>{msg.message}</td>
                      <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionRow}>
                          <button
                            onClick={() => handleToggleMessageRead(msg.id, !msg.read)}
                            className={styles.btnReschedule}
                            title={msg.read ? 'Mark Unread' : 'Mark Read'}
                          >
                            {msg.read ? <Mail size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={styles.btnDelete}
                            title="Delete Message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.noDataRow}>Inbox is empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
