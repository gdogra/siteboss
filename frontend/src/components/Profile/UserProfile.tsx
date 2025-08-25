import React, { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  CameraIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import RoleIndicator from '../UI/RoleIndicator';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not logged in</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData: Partial<typeof user>) => {
    updateUser(updatedData);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // In a real app, upload to Supabase storage
      // For now, we'll create a local URL
      const avatarUrl = URL.createObjectURL(file);
      updateUser({ avatar_url: avatarUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'company_admin':
        return 'Full access to all system features and user management';
      case 'project_manager':
        return 'Manage projects, tasks, budgets, and team members';
      case 'foreman':
        return 'Oversee field operations and manage workers';
      case 'worker':
        return 'Track time, complete tasks, and view project information';
      case 'client':
        return 'View project progress and access documents';
      default:
        return 'Standard user access';
    }
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  )}
                </div>
                
                {/* Upload Avatar Button */}
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-primary-100 text-lg">{user.email}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <RoleIndicator />
                  <div className="flex items-center text-primary-100 text-sm">
                    {user.email_verified !== false ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Email Verified
                      </>
                    ) : (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Email Not Verified
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                Edit Profile
              </button>
              
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ShieldCheckIcon className="-ml-1 mr-2 h-5 w-5" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              </div>
              
              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{user.first_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{user.last_name}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                </div>
                
                {user.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{user.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-8">
            {/* Role Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Role & Permissions</h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Role
                    </label>
                    <RoleIndicator className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {user.company_id === 'demo-company-1' ? 'Demo Company' : 'ACME Construction'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Account Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Verified</span>
                  {user.email_verified !== false ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XMarkIcon className="h-3 w-3 mr-1" />
                      Not Verified
                    </span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <span className="text-sm text-gray-900">
                    {formatLastLogin(user.last_login)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
      
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default UserProfile;