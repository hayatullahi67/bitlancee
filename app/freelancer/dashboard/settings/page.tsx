'use client';

import React, { useState } from 'react';
import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';

export default function SettingsPage() {
  const [accountSettings, setAccountSettings] = useState({
    notifications: {
      email: true,
      marketing: false,
      projectUpdates: true
    },
    privacy: {
      showProfile: true,
      showContact: false
    }
  });

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <FreelancerSidebar active="/freelancer/dashboard/settings" />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="h-screen overflow-y-auto pt-4 md:pt-0 bg-[#F7F6F3]">
            <div className="max-w-[100%] mx-auto p-6 md:p-12 space-y-8">
              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-sm text-gray-600 mt-2">Manage your account preferences, notifications, and privacy settings.</p>
              </div>

              {/* Account Settings Content */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">Email notifications</span>
                        <p className="text-xs text-gray-500">Receive email updates about your account and projects</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.notifications.email}
                        onChange={(e) => setAccountSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">Marketing emails</span>
                        <p className="text-xs text-gray-500">Receive promotional emails and platform updates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.notifications.marketing}
                        onChange={(e) => setAccountSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, marketing: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">Project updates</span>
                        <p className="text-xs text-gray-500">Get notified about project proposals and messages</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.notifications.projectUpdates}
                        onChange={(e) => setAccountSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, projectUpdates: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Privacy Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">Show profile to clients</span>
                        <p className="text-xs text-gray-500">Allow potential clients to view your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.privacy.showProfile}
                        onChange={(e) => setAccountSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showProfile: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">Show contact information</span>
                        <p className="text-xs text-gray-500">Display your email and contact details publicly</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.privacy.showContact}
                        onChange={(e) => setAccountSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showContact: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Account Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Change Password</label>
                      <p className="text-xs text-gray-500 mb-3">Update your account password regularly for security</p>
                      <button className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700">
                        Change Password
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Two-Factor Authentication</label>
                      <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 border border-orange-600 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Account Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Export Account Data</label>
                      <p className="text-xs text-gray-500 mb-3">Download all your account data and information</p>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                        Export Data
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 text-red-600">Delete Account</label>
                      <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data</p>
                      <button className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Actions */}
              <div className="bg-transparent rounded-xl p-0">
                <div className="flex flex-wrap gap-3 justify-end">
                  <button className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
                    Discard Changes
                  </button>
                  <button className="px-6 py-2 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}