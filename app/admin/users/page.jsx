"use client";
import React, { useState, useEffect } from 'react';
import AdminNav from '@/app/component/AdminNav';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaEdit, FaTrash, FaUserShield, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

const UsersPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        isAdmin: false
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
        if (status === "authenticated") {
            fetchUsers();
        }
    }, [status, router, session]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('User added successfully!');
                setShowAddModal(false);
                setFormData({ fullName: '', email: '', password: '', isAdmin: false });
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                userId: selectedUser._id,
                fullName: formData.fullName,
                email: formData.email,
                isAdmin: formData.isAdmin
            };

            if (formData.password) {
                updateData.newPassword = formData.password;
            }

            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert('User updated successfully!');
                setShowEditModal(false);
                setSelectedUser(null);
                setFormData({ fullName: '', email: '', password: '', isAdmin: false });
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user');
        }
    };

    const handleDeleteUser = async () => {
        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser._id })
            });

            if (response.ok) {
                alert('User deleted successfully!');
                setShowDeleteModal(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            isAdmin: user.isAdmin
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (status === "loading" || loading) {
        return (
            <AdminNav>
                <div className="w-full h-full flex items-center justify-center text-black text-center">
                    Loading users data...
                </div>
            </AdminNav>
        );
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
        return (
            <AdminNav>
                <div className="w-full h-full flex items-center justify-center text-black text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Access Denied: Admin privileges required
                    </div>
                </div>
            </AdminNav>
        );
    }

    return (
        <AdminNav>
            <div className="w-full h-full p-2 md:p-6 bg-[#E9E9E9] overflow-y-auto">
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                    {/* Header */}
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Users</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage system users and their permissions
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FaUserPlus />
                            <span className="hidden md:inline">Add User</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <MdAdminPanelSettings className="text-red-500" />
                                <span>Admins: {users.filter(u => u.isAdmin).length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                <span>Employees: {users.filter(u => !u.isAdmin).length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Total: {users.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                        {session?.user?.id === user._id && (
                                                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${
                                                    user.isAdmin 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.isAdmin ? <FaUserShield /> : <FaUser />}
                                                    {user.isAdmin ? 'Admin' : 'Employee'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {formatDate(user.dateAdded)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title="Edit User"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    {session?.user?.id !== user._id && (
                                                        <button
                                                            onClick={() => openDeleteModal(user)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Delete User"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAdmin}
                                        onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Admin User</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({ fullName: '', email: '', password: '', isAdmin: false });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password (leave blank to keep current)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAdmin}
                                        onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Admin User</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedUser(null);
                                        setFormData({ fullName: '', email: '', password: '', isAdmin: false });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete user <strong>{selectedUser.fullName}</strong>? 
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminNav>
    );
};

export default UsersPage;