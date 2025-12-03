import React, { useState, useEffect, useMemo } from 'react';
import { AdminUser, AdminScreen, UserRole, UserStatus } from '../../types';
import {
    getUsers, deleteUser, updateUserStatus, resetUserProgress,
    createUser, updateUser, getUserStats
} from '../../services/questDataService';

interface UserManagerProps {
    onNavigate: (screen: AdminScreen) => void;
    onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ onBack }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [resetConfirm, setResetConfirm] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState(getUserStats());

    useEffect(() => {
        setUsers(getUsers());
        setUserStats(getUserStats());
    }, []);

    const refreshData = () => {
        setUsers(getUsers());
        setUserStats(getUserStats());
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    u.username.toLowerCase().includes(query) ||
                    u.displayName.toLowerCase().includes(query) ||
                    (u.email && u.email.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            if (statusFilter !== 'all' && u.status !== statusFilter) {
                return false;
            }

            if (roleFilter !== 'all' && u.role !== roleFilter) {
                return false;
            }

            return true;
        });
    }, [users, searchQuery, statusFilter, roleFilter]);

    const handleDelete = (id: string) => {
        if (deleteConfirm === id) {
            if (deleteUser(id)) {
                refreshData();
                if (selectedUser?.id === id) {
                    setSelectedUser(null);
                }
            }
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
        }
    };

    const handleStatusChange = (id: string, status: UserStatus) => {
        updateUserStatus(id, status);
        refreshData();
        if (selectedUser?.id === id) {
            setSelectedUser({ ...selectedUser, status });
        }
    };

    const handleResetProgress = (id: string) => {
        if (resetConfirm === id) {
            resetUserProgress(id);
            refreshData();
            setResetConfirm(null);
        } else {
            setResetConfirm(id);
        }
    };

    const formatTimeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const formatPlayTime = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getStatusBadge = (status: UserStatus): string => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'inactive': return 'bg-slate-100 text-slate-600';
            case 'banned': return 'bg-red-100 text-red-700';
        }
    };

    const getRoleBadge = (role: UserRole): string => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'player': return 'bg-sky-100 text-sky-700';
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                onClick={onBack}
                                className="text-indigo-600 hover:text-indigo-800 transition-colors text-base font-medium flex items-center gap-1 mb-1"
                            >
                                &larr; Back to Dashboard
                            </button>
                            <h1 className="text-3xl font-bold text-slate-800">
                                User Management
                            </h1>
                        </div>
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setSelectedUser(null);
                            }}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                        >
                            + New User
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex">
                    {/* User List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Stats Bar */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <div className="text-3xl font-bold text-indigo-600">{userStats.totalUsers}</div>
                                <div className="text-slate-500 text-base">Total Users</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <div className="text-3xl font-bold text-emerald-600">{userStats.activeUsers}</div>
                                <div className="text-slate-500 text-base">Active</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <div className="text-3xl font-bold text-amber-600">{userStats.avgLevel}</div>
                                <div className="text-slate-500 text-base">Avg Level</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <div className="text-3xl font-bold text-sky-600">{userStats.totalChallengesCompleted}</div>
                                <div className="text-slate-500 text-base">Challenges Done</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-600 text-base font-medium mb-2">Search</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search users..."
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-600 text-base font-medium mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-600 text-base font-medium mb-2">Role</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="player">Player</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="text-slate-500 text-base mb-4">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>

                        {/* User List */}
                        <div className="space-y-3">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsCreating(false);
                                    }}
                                    className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                                        selectedUser?.id === user.id
                                            ? 'border-indigo-400'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                    {user.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-semibold text-slate-800">{user.displayName}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${getStatusBadge(user.status)}`}>
                                                            {user.status}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-500 text-base">@{user.username}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-800 font-semibold text-lg">Level {user.level}</div>
                                                <div className="text-slate-500 text-sm">{formatTimeAgo(user.lastActive)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-6 text-base text-slate-600">
                                            <span>XP: <strong>{user.xp.toLocaleString()}</strong></span>
                                            <span>DataBits: <strong>{user.dataBits}</strong></span>
                                            <span>Challenges: <strong>{user.challengesCompleted}</strong></span>
                                            <span>Play Time: <strong>{formatPlayTime(user.totalPlayTime)}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-slate-400 text-lg">
                                No users match your filters.
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {(selectedUser || isCreating) && (
                        <UserDetailPanel
                            user={selectedUser}
                            isCreating={isCreating}
                            error={error}
                            deleteConfirm={deleteConfirm}
                            resetConfirm={resetConfirm}
                            onClose={() => {
                                setSelectedUser(null);
                                setIsCreating(false);
                                setError(null);
                            }}
                            onSave={(userData) => {
                                try {
                                    if (isCreating) {
                                        createUser(userData);
                                    } else if (selectedUser) {
                                        updateUser(selectedUser.id, userData);
                                    }
                                    refreshData();
                                    setSelectedUser(null);
                                    setIsCreating(false);
                                    setError(null);
                                } catch (e: any) {
                                    setError(e.message || 'Failed to save user');
                                }
                            }}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            onResetProgress={handleResetProgress}
                            formatTimeAgo={formatTimeAgo}
                            formatPlayTime={formatPlayTime}
                            getStatusBadge={getStatusBadge}
                            getRoleBadge={getRoleBadge}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Detail/Edit Panel Component
interface UserDetailPanelProps {
    user: AdminUser | null;
    isCreating: boolean;
    error: string | null;
    deleteConfirm: string | null;
    resetConfirm: string | null;
    onClose: () => void;
    onSave: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: UserStatus) => void;
    onResetProgress: (id: string) => void;
    formatTimeAgo: (timestamp: number) => string;
    formatPlayTime: (minutes: number) => string;
    getStatusBadge: (status: UserStatus) => string;
    getRoleBadge: (role: UserRole) => string;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
    user,
    isCreating,
    error,
    deleteConfirm,
    resetConfirm,
    onClose,
    onSave,
    onDelete,
    onStatusChange,
    onResetProgress,
    formatTimeAgo,
    formatPlayTime,
    getStatusBadge,
    getRoleBadge
}) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        displayName: user?.displayName || '',
        email: user?.email || '',
        role: user?.role || 'player' as UserRole,
        status: user?.status || 'active' as UserStatus,
        notes: user?.notes || '',
        level: user?.level || 1,
        xp: user?.xp || 0,
        dataBits: user?.dataBits || 0,
        accessKeys: user?.accessKeys || 0,
        challengesCompleted: user?.challengesCompleted || 0,
        totalPlayTime: user?.totalPlayTime || 0,
        lastActive: user?.lastActive || Date.now()
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                displayName: user.displayName,
                email: user.email || '',
                role: user.role,
                status: user.status,
                notes: user.notes || '',
                level: user.level,
                xp: user.xp,
                dataBits: user.dataBits,
                accessKeys: user.accessKeys,
                challengesCompleted: user.challengesCompleted,
                totalPlayTime: user.totalPlayTime,
                lastActive: user.lastActive
            });
        } else if (isCreating) {
            setFormData({
                username: '',
                displayName: '',
                email: '',
                role: 'player',
                status: 'active',
                notes: '',
                level: 1,
                xp: 0,
                dataBits: 0,
                accessKeys: 0,
                challengesCompleted: 0,
                totalPlayTime: 0,
                lastActive: Date.now()
            });
        }
    }, [user, isCreating]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="w-96 border-l border-slate-200 bg-white overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    {isCreating ? 'Create User' : 'Edit User'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                    &times;
                </button>
            </div>

            {error && (
                <div className="mx-5 mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-base">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Avatar Preview */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {formData.displayName.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>

                {/* Basic Info */}
                <div>
                    <label className="block text-slate-700 text-base font-medium mb-2">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="agent_nova"
                        required
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-slate-700 text-base font-medium mb-2">
                        Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Nova"
                        required
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-slate-700 text-base font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 text-base font-medium mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="player">Player</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-700 text-base font-medium mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-700 text-base font-medium mb-2">Admin Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Notes about this user..."
                        rows={3}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                {/* Progress Stats (only show for existing users) */}
                {!isCreating && user && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <h3 className="text-base font-semibold text-slate-700">Progress Stats</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-slate-500">Level:</span>
                                <span className="ml-2 text-slate-800 font-medium">{user.level}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">XP:</span>
                                <span className="ml-2 text-slate-800 font-medium">{user.xp.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">DataBits:</span>
                                <span className="ml-2 text-slate-800 font-medium">{user.dataBits}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Access Keys:</span>
                                <span className="ml-2 text-slate-800 font-medium">{user.accessKeys}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Challenges:</span>
                                <span className="ml-2 text-slate-800 font-medium">{user.challengesCompleted}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Play Time:</span>
                                <span className="ml-2 text-slate-800 font-medium">{formatPlayTime(user.totalPlayTime)}</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">Last Active:</span>
                            <span className="ml-2 text-slate-800 font-medium">{formatTimeAgo(user.lastActive)}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">Joined:</span>
                            <span className="ml-2 text-slate-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold text-base hover:bg-indigo-700 transition-colors"
                    >
                        {isCreating ? 'Create User' : 'Save Changes'}
                    </button>

                    {!isCreating && user && (
                        <>
                            <button
                                type="button"
                                onClick={() => onResetProgress(user.id)}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-colors ${
                                    resetConfirm === user.id
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                {resetConfirm === user.id ? 'Confirm Reset?' : 'Reset Progress'}
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(user.id)}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-colors ${
                                    deleteConfirm === user.id
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                            >
                                {deleteConfirm === user.id ? 'Confirm Delete?' : 'Delete User'}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserManager;
