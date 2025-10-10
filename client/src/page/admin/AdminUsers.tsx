import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';
import UserTable from '../../component/admin/UserTable';
import UserModal from '../../component/admin/UserModal';
import DeleteUserModal from '../../component/admin/DeleteUserModal';
import Pagination from '../../component/admin/Pagination';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getUsers(
        currentPage,
        itemsPerPage,
        searchTerm,
        roleFilter,
        'createdAt',
        'DESC'
      );

      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await adminService.updateUserRole(userId, role);
      await loadUsers();
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      await loadUsers();
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaUsers className="text-purple-400 text-4xl" />
              <div>
                <h1 className="text-4xl font-bold text-white">Gestion des utilisateurs</h1>
                <p className="text-slate-400 mt-1">{totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total</p>
              </div>
            </div>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher par email ou nom d'utilisateur..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Tous les rôles</option>
                  <option value="user">Utilisateurs</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={loadUsers}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <UserTable
                  users={users}
                  onEdit={setSelectedUser}
                  onDelete={setUserToDelete}
                  currentUserId={currentUser?.id || ''}
                />
                <div className="p-4 border-t border-slate-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          currentUserId={currentUser?.id || ''}
          onClose={() => setSelectedUser(null)}
          onUpdateRole={handleUpdateRole}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </AdminDashboardLayout>
  );
}
