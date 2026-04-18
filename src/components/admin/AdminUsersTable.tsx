import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { User } from '../../types';

interface AdminUsersTableProps {
  users: User[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onToggleActive: (user: User) => void;
  onDelete: (id: string) => void;
  onPromoteAdmin: (id: string) => void;
  loading: boolean;
}

type SortKey = keyof Pick<User, 'display_name' | 'email' | 'role' | 'is_active' | 'created_at'>;
type SortDir = 'asc' | 'desc';

export default function AdminUsersTable({
  users, total, page, onPageChange,
  onToggleActive, onDelete, onPromoteAdmin, loading,
}: AdminUsersTableProps) {
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState<'all' | 'active' | 'inactive'>('all');
  const [roleF, setRoleF]       = useState<'all' | 'user' | 'admin'>('all');
  const [sort, setSort]         = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<User | null>(null);

  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let r = users.filter(u => {
      const matchS = u.display_name.toLowerCase().includes(search.toLowerCase()) ||
                     u.email.toLowerCase().includes(search.toLowerCase());
      const matchSt = statusF === 'all' ? true : statusF === 'active' ? u.is_active : !u.is_active;
      const matchR  = roleF === 'all' ? true : u.role === roleF;
      return matchS && matchSt && matchR;
    });
    if (sort) {
      r = [...r].sort((a, b) => {
        const va = a[sort.key]; const vb = b[sort.key];
        if (va < vb) return sort.dir === 'asc' ? -1 : 1;
        if (va > vb) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [users, search, statusF, roleF, sort]);

  const handleSort = (key: SortKey) =>
    setSort(p => p?.key === key ? (p.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });

  const toggleSelect = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const bulkDeactivate = () => {
    const targets = filtered.filter(u => selected.has(u.id) && u.is_active);
    if (!targets.length) { toast('Aucun utilisateur actif sélectionné', { icon: 'ℹ️' }); return; }
    targets.forEach(u => onToggleActive(u));
    setSelected(new Set());
    toast.success(`${targets.length} utilisateur(s) désactivé(s)`);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort?.key !== k) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: 'var(--or)', marginLeft: 4 }}>{sort.dir === 'asc' ? '▲' : '▼'}</span>;
  };

  const start = (page - 1) * PAGE_SIZE + 1;
  const end   = Math.min(page * PAGE_SIZE, total);

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left', fontSize: 10,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'var(--muted)', borderBottom: '0.5px solid var(--border)',
    cursor: 'pointer', userSelect: 'none', background: 'var(--cream)',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '13px 16px', borderBottom: '0.5px solid rgba(201,168,76,0.1)',
    fontSize: 13, color: 'var(--dark)', verticalAlign: 'middle',
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom, email..."
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px',
            border: '0.5px solid var(--border)', background: 'white',
            fontFamily: "'Jost', sans-serif", fontSize: 13, color: 'var(--dark)',
            outline: 'none', borderRadius: 1,
          }}
        />
        <select value={statusF} onChange={e => setStatusF(e.target.value as typeof statusF)}
          style={{ padding: '10px 12px', border: '0.5px solid var(--border)', background: 'white', fontSize: 13, outline: 'none' }}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select value={roleF} onChange={e => setRoleF(e.target.value as typeof roleF)}
          style={{ padding: '10px 12px', border: '0.5px solid var(--border)', background: 'white', fontSize: 13, outline: 'none' }}>
          <option value="all">Tous les rôles</option>
          <option value="user">Membres</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
          background: 'var(--rose-pale)', border: '0.5px solid var(--rose)',
          marginBottom: 12, fontSize: 13,
        }}>
          <span>{selected.size} sélectionné(s)</span>
          <button className="outline-btn" style={{ padding: '6px 18px', fontSize: 11 }} onClick={bulkDeactivate}>
            Désactiver la sélection
          </button>
          <button className="outline-btn" style={{ padding: '6px 18px', fontSize: 11 }} onClick={() => setSelected(new Set())}>
            Désélectionner
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', background: 'white', border: '0.5px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>
                <input type="checkbox"
                  checked={selected.size > 0 && selected.size === filtered.length}
                  onChange={e => setSelected(e.target.checked ? new Set(filtered.map(u => u.id)) : new Set())}
                />
              </th>
              {(['display_name', 'email', 'role', 'is_active', 'created_at'] as SortKey[]).map(k => (
                <th key={k} style={thStyle} onClick={() => handleSort(k)}>
                  {k === 'display_name' ? 'Nom' : k === 'email' ? 'Email' : k === 'role' ? 'Rôle' : k === 'is_active' ? 'Statut' : 'Inscription'}
                  <SortIcon k={k} />
                </th>
              ))}
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={tdStyle}>
                      <div style={{ height: 16, background: '#eee', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} style={{ background: selected.has(u.id) ? 'var(--or-light)' : undefined }}>
                  <td style={tdStyle}>
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="table-avatar">{u.display_name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.display_name}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--muted)' }}>{u.email}</td>
                  <td style={tdStyle}>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                  <td style={tdStyle}>
                    <span className={`badge badge-${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--muted)' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={tdStyle}>
                    <div className="table-actions">
                      <button className="action-btn action-toggle" onClick={() => onToggleActive(u)} title={u.is_active ? 'Désactiver' : 'Activer'}>
                        {u.is_active ? '⏸' : '▶'}
                      </button>
                      {u.role !== 'admin' && (
                        <button className="action-btn action-toggle" onClick={() => onPromoteAdmin(u.id)} title="Promouvoir admin">⭐</button>
                      )}
                      <button className="action-btn action-delete" onClick={() => setToDelete(u)} title="Supprimer">✕</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 0' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {total > 0 ? `${start} – ${end} sur ${total}` : '0 résultat'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="outline-btn" style={{ padding: '6px 16px' }} disabled={page === 1} onClick={() => onPageChange(page - 1)}>←</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--muted)' }}>Page {page}</span>
          <button className="outline-btn" style={{ padding: '6px 16px' }} disabled={end >= total} onClick={() => onPageChange(page + 1)}>→</button>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {toDelete && (
        <div className="modal-overlay" onClick={() => setToDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 className="modal-title">Supprimer cet utilisateur ?</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
              Vous êtes sur le point de supprimer définitivement <strong>{toDelete.display_name}</strong>.
              Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button className="outline-btn" onClick={() => setToDelete(null)}>Annuler</button>
              <button className="filled-btn" style={{ background: '#c0392b', borderColor: '#c0392b' }} onClick={() => { onDelete(toDelete.id); setToDelete(null); }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
