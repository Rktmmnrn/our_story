import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { adminApi } from '../services/api';
import type { AdminStats, User } from '../types';
import AdminUsersTable from '../components/admin/AdminUsersTable';

type Tab = 'stats' | 'users' | 'couples' | 'media';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab, setTab]       = useState<Tab>('stats');
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [users, setUsers]   = useState<User[]>([]);
  const [couples, setCouples] = useState<any[]>([]);
  const [media, setMedia]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { navigate('/app'); return; }
    loadStats();
  }, [user, navigate]);

  useEffect(() => {
    if (tab === 'users')   loadUsers();
    if (tab === 'couples') loadCouples();
    if (tab === 'media')   loadMedia();
  }, [tab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const s = await adminApi.stats();
      setStats(s);
    } catch { toast.error('Erreur chargement stats'); }
    finally { setLoading(false); }
  };

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers(page);
      setUsers(res.data as User[]);
      setUsersTotal(res.total);
      setUsersPage(page);
    } catch { toast.error('Erreur chargement utilisateurs'); }
    finally { setLoading(false); }
  };

  const loadCouples = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listCouples();
      setCouples(res.data as any[]);
    } catch { toast.error('Erreur chargement couples'); }
    finally { setLoading(false); }
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listMedia();
      setMedia(res.data as any[]);
    } catch { toast.error('Erreur chargement médias'); }
    finally { setLoading(false); }
  };

  const handleToggleUser = async (u: User) => {
    try {
      await adminApi.updateUser(u.id, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
      toast.success(u.is_active ? 'Utilisateur désactivé' : 'Utilisateur activé');
    } catch { toast.error('Erreur'); }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Utilisateur supprimé');
      loadStats();
    } catch { toast.error('Impossible de supprimer'); }
  };

  const handlePromoteAdmin = async (id: string) => {
    try {
      await adminApi.updateUser(id, { role: 'admin' });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' as const } : u));
      toast.success('Utilisateur promu administrateur ✦');
    } catch { toast.error('Erreur lors de la promotion'); }
  };

  const handleDeleteCouple = async (id: string) => {
    if (!confirm('Supprimer ce couple et toutes ses données ?')) return;
    try {
      await adminApi.deleteCouple(id);
      setCouples(prev => prev.filter(c => c.id !== id));
      toast.success('Couple supprimé');
      loadStats();
    } catch { toast.error('Impossible de supprimer'); }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Supprimer ce média ?')) return;
    try {
      await adminApi.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success('Média supprimé');
      loadStats();
    } catch { toast.error('Impossible de supprimer'); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const fmtBytes = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${(b / 1024).toFixed(0)} Ko`;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'stats',   label: 'Dashboard',      icon: '📊' },
    { key: 'users',   label: 'Utilisateurs',   icon: '👥' },
    { key: 'couples', label: 'Couples',         icon: '♡'  },
    { key: 'media',   label: 'Médias',          icon: '🖼️' },
  ];

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-heart">♡</span>
          <div>
            <div className="admin-logo-title">Notre Histoire</div>
            <div className="admin-logo-sub">Administration</div>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`admin-nav-item ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="admin-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{user?.display_name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user?.display_name}</div>
              <div className="admin-user-role">Administrateur</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} title="Déconnexion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* STATS */}
        {tab === 'stats' && (
          <div className="admin-content">
            <div className="admin-page-header">
              <h1>Tableau de bord</h1>
              <p>Vue d'ensemble de la plateforme</p>
            </div>
            {loading ? <div className="admin-loading">Chargement...</div> : stats && (
              <>
                <div className="stats-grid">
                  {[
                    { label: 'Utilisateurs',    value: stats.total_users,        sub: `${stats.active_users} actifs`,                             icon: '👥', color: '#d4607a' },
                    { label: 'Couples',         value: stats.total_couples,      sub: `${stats.active_couples} actifs`,                           icon: '♡',  color: '#c9a84c' },
                    { label: 'Médias',          value: stats.total_media,        sub: `${stats.total_photos} photos · ${stats.total_videos} vidéos`, icon: '🖼️', color: '#7c6d8a' },
                    { label: 'Musiques',        value: stats.total_music_tracks, sub: 'pistes audio',                                             icon: '♪',  color: '#4a8fa8' },
                    { label: 'Dates spéciales', value: stats.total_special_dates,sub: 'moments mémorables',                                      icon: '📅', color: '#5a8a5a' },
                    { label: 'Citations',       value: stats.total_quotes,       sub: 'mots du cœur',                                            icon: '💬', color: '#a84a4a' },
                  ].map(s => (
                    <div className="stat-card" key={s.label}>
                      <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                      <div className="stat-card-body">
                        <div className="stat-card-value">{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                        <div className="stat-card-sub">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Utilisation disque */}
                {stats.disk_usage_mb && Object.keys(stats.disk_usage_mb).length > 0 && (
                  <div className="admin-card">
                    <h3 className="admin-card-title">Utilisation disque</h3>
                    <div className="disk-usage-grid">
                      {Object.entries(stats.disk_usage_mb).map(([folder, mb]) => (
                        <div key={folder} className="disk-item">
                          <span className="disk-folder">{folder}</span>
                          <span className="disk-size">{(mb as number).toFixed(2)} Mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Utilisateurs récents */}
                {stats.recent_users?.length > 0 && (
                  <div className="admin-card">
                    <h3 className="admin-card-title">Utilisateurs récents</h3>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr>
                        </thead>
                        <tbody>
                          {stats.recent_users.map(u => (
                            <tr key={u.id}>
                              <td>{u.display_name}</td>
                              <td>{u.email}</td>
                              <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                              <td><span className={`badge badge-${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Actif' : 'Inactif'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* USERS — utilise AdminUsersTable de Gemini */}
        {tab === 'users' && (
          <div className="admin-content">
            <div className="admin-page-header">
              <h1>Utilisateurs</h1>
              <p>{usersTotal} utilisateur(s) au total</p>
            </div>
            <div className="admin-card" style={{ padding: 24 }}>
              <AdminUsersTable
                users={users}
                total={usersTotal}
                page={usersPage}
                onPageChange={loadUsers}
                onToggleActive={handleToggleUser}
                onDelete={handleDeleteUser}
                onPromoteAdmin={handlePromoteAdmin}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* COUPLES */}
        {tab === 'couples' && (
          <div className="admin-content">
            <div className="admin-page-header">
              <h1>Couples</h1>
              <p>Tous les couples de la plateforme</p>
            </div>
            {loading ? <div className="admin-loading">Chargement...</div> : (
              <div className="admin-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Nom</th><th>Anniversaire</th><th>Membres</th><th>Statut</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {couples.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Aucun couple</td></tr>
                      ) : couples.map((c: any) => (
                        <tr key={c.id}>
                          <td>{c.couple_name || '—'}</td>
                          <td>{c.anniversary_date}</td>
                          <td>{c.user2_id ? '2 membres' : '1 membre'}</td>
                          <td><span className={`badge badge-${c.is_active ? 'active' : 'inactive'}`}>{c.is_active ? 'Actif' : 'Inactif'}</span></td>
                          <td>
                            <button className="action-btn action-delete" onClick={() => handleDeleteCouple(c.id)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEDIA */}
        {tab === 'media' && (
          <div className="admin-content">
            <div className="admin-page-header">
              <h1>Médias</h1>
              <p>Tous les fichiers uploadés</p>
            </div>
            {loading ? <div className="admin-loading">Chargement...</div> : (
              <div className="admin-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Fichier</th><th>Type</th><th>Taille</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {media.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Aucun média</td></tr>
                      ) : media.map((m: any) => (
                        <tr key={m.id}>
                          <td className="media-filename">{m.original_filename}</td>
                          <td><span className={`badge badge-${m.media_type}`}>{m.media_type}</span></td>
                          <td>{fmtBytes(m.file_size_bytes)}</td>
                          <td>{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <button className="action-btn action-delete" onClick={() => handleDeleteMedia(m.id)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
