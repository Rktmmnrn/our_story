import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import './styles/AdminUsersTable.css';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

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

type SortKey = keyof User;
type SortDirection = 'asc' | 'desc';

export default function AdminUsersTable({
  users,
  total,
  page,
  onPageChange,
  onToggleActive,
  onDelete,
  onPromoteAdmin,
  loading,
}: AdminUsersTableProps) {
  // --- États locaux ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const pageSize = 10; // À adapter si votre pagination backend est différente

  // --- Logique de filtrage et de tri ---
  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchSearch = 
        user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        statusFilter === 'all' ? true : 
        statusFilter === 'active' ? user.is_active : !user.is_active;
        
      const matchRole = roleFilter === 'all' ? true : user.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });

    if (sortConfig) {
      result = result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, statusFilter, roleFilter, sortConfig]);

  // --- Gestionnaires d'événements ---
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredAndSortedUsers.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDeactivate = () => {
    const activeUsersToDeactivate = filteredAndSortedUsers.filter(
      u => selectedIds.has(u.id) && u.is_active
    );
    
    if (activeUsersToDeactivate.length === 0) {
      toast("Aucun utilisateur actif sélectionné.", { icon: 'ℹ️' });
      return;
    }

    activeUsersToDeactivate.forEach(user => onToggleActive(user));
    setSelectedIds(new Set());
    toast.success(`${activeUsersToDeactivate.length} utilisateur(s) désactivé(s)`);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setUserToDelete(null);
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userToDelete.id);
        return newSet;
      });
    }
  };

  // --- Rendus partiels ---
  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig?.key !== column) return <span className="sort-icon inactive">↕</span>;
    return <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const startCount = (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, total);

  return (
    <div className="admin-table-container">
      {/* Barre d'outils (Filtres & Recherche) */}
      <div className="table-toolbar">
        <input 
          type="text" 
          placeholder="Rechercher par nom, email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="all">Tous les rôles</option>
            <option value="user">Utilisateurs</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>
      </div>

      {/* Actions de masse */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.size} sélectionné(s)</span>
          <button className="btn-outline" onClick={handleBulkDeactivate}>
            Désactiver la sélection
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="table-wrapper">
        <table className="lux-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedUsers.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('display_name')}>Nom <SortIndicator column="display_name" /></th>
              <th onClick={() => handleSort('email')}>Email <SortIndicator column="email" /></th>
              <th onClick={() => handleSort('role')}>Rôle <SortIndicator column="role" /></th>
              <th onClick={() => handleSort('is_active')}>Statut <SortIndicator column="is_active" /></th>
              <th onClick={() => handleSort('created_at')}>Date d'inscription <SortIndicator column="created_at" /></th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skeleton-box checkbox" /></td>
                  <td><div className="skeleton-box" /></td>
                  <td><div className="skeleton-box" /></td>
                  <td><div className="skeleton-box badge" /></td>
                  <td><div className="skeleton-box badge" /></td>
                  <td><div className="skeleton-box" /></td>
                  <td><div className="skeleton-box actions" /></td>
                </tr>
              ))
            ) : filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">Aucun utilisateur trouvé.</td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className={selectedIds.has(user.id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(user.id)}
                      onChange={() => handleSelectOne(user.id)}
                    />
                  </td>
                  <td className="fw-medium">{user.display_name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span className={`badge role-${user.role}`}>
                      {user.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="row-actions">
                    <button 
                      onClick={() => onToggleActive(user)} 
                      className="action-btn text-muted"
                      title={user.is_active ? "Désactiver" : "Activer"}
                    >
                      {user.is_active ? '⏸' : '▶️'}
                    </button>
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => onPromoteAdmin(user.id)} 
                        className="action-btn text-or"
                        title="Promouvoir Admin"
                      >
                        ⭐
                      </button>
                    )}
                    <button 
                      onClick={() => setUserToDelete(user)} 
                      className="action-btn text-rose"
                      title="Supprimer"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-footer">
        <span className="pagination-info">
          Affichage {startCount} - {endCount} sur {total} utilisateurs
        </span>
        <div className="pagination-controls">
          <button 
            disabled={page === 1} 
            onClick={() => onPageChange(page - 1)}
            className="btn-page"
          >
            ← Précédent
          </button>
          <button 
            disabled={endCount >= total} 
            onClick={() => onPageChange(page + 1)}
            className="btn-page"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {userToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Supprimer cet utilisateur ?</h3>
            <p className="modal-body">
              Vous êtes sur le point de supprimer définitivement <strong>{userToDelete.display_name}</strong>. Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setUserToDelete(null)}>Annuler</button>
              <button className="btn-delete" onClick={confirmDelete}>Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}