import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { HomeButton } from '../components/HomeButton';
import {
  User,
  Bell,
  Lock,
  Monitor,
  Settings as SettingsIcon,
  Shield,
  Code,
  HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Save,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'appearance' | 'general' | 'security' | 'advanced' | 'help';

export function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [accountData, setAccountData] = useState({
    fullName: '',
    email: '',
    studentNumber: '',
    program: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    startupInvites: true,
    connectionRequests: true,
    courseUpdates: true,
    weeklyDigest: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'full' as 'full' | 'limited' | 'private',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowConnectionRequests: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark' as 'light' | 'dark' | 'system',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    compactMode: false,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setAccountData({
          fullName: data.full_name || '',
          email: user.email || '',
          studentNumber: data.student_number || '',
          program: data.program || '',
        });
        setPrivacySettings({
          ...privacySettings,
          profileVisibility: data.privacy_level || 'full',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function saveAccountSettings() {
    if (!user || !profile) return;

    setLoading(true);
    try {
      await supabase
        .from('student_profiles')
        .update({
          full_name: accountData.fullName,
          student_number: accountData.studentNumber,
          program: accountData.program,
        })
        .eq('id', profile.id);

      alert('Account settings saved successfully');
    } catch (error) {
      console.error('Error saving account settings:', error);
      alert('Failed to save account settings');
    } finally {
      setLoading(false);
    }
  }

  async function savePrivacySettings() {
    if (!user || !profile) return;

    setLoading(true);
    try {
      await supabase
        .from('student_profiles')
        .update({
          privacy_level: privacySettings.profileVisibility,
        })
        .eq('id', profile.id);

      alert('Privacy settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword,
      });

      if (error) throw error;

      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,
      });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  function saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    alert('Notification preferences saved');
  }

  function saveAppearanceSettings() {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    alert('Appearance settings saved');
  }

  const tabs = [
    { id: 'account' as SettingsTab, label: 'Account', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Lock },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Monitor },
    { id: 'general' as SettingsTab, label: 'General', icon: SettingsIcon },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'advanced' as SettingsTab, label: 'Advanced', icon: Code },
    { id: 'help' as SettingsTab, label: 'Help Center', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            ← Back to Dashboard
          </Link>
          <HomeButton />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{tab.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 hover:border hover:border-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="flex-1 text-left font-medium">Log Out</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                    <p className="text-gray-400">Manage your account information</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={accountData.fullName}
                      onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={accountData.email}
                      disabled
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Student Number</label>
                    <input
                      type="text"
                      value={accountData.studentNumber}
                      onChange={(e) => setAccountData({ ...accountData, studentNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Program</label>
                    <input
                      type="text"
                      value={accountData.program}
                      onChange={(e) => setAccountData({ ...accountData, program: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <button
                    onClick={saveAccountSettings}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
                    <p className="text-gray-400">Control how you receive notifications</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-400">Receive push notifications in browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Startup Invites</p>
                        <p className="text-sm text-gray-400">Get notified when invited to join startups</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.startupInvites}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, startupInvites: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Connection Requests</p>
                        <p className="text-sm text-gray-400">Get notified of new connection requests</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.connectionRequests}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, connectionRequests: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Course Updates</p>
                        <p className="text-sm text-gray-400">Notifications about course outline changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.courseUpdates}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, courseUpdates: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-gray-400">Receive weekly summary of activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveNotificationSettings}
                    className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Preferences
                  </button>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Privacy Settings</h2>
                    <p className="text-gray-400">Control who can see your information</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      <option value="full">Public - Everyone can see my profile</option>
                      <option value="limited">Limited - Only verified students</option>
                      <option value="private">Private - Only my connections</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Show Email Address</p>
                        <p className="text-sm text-gray-400">Display email on your public profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Show Phone Number</p>
                        <p className="text-sm text-gray-400">Display phone on your public profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Allow Direct Messages</p>
                        <p className="text-sm text-gray-400">Let others send you messages</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.allowMessages}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div>
                        <p className="font-medium">Allow Connection Requests</p>
                        <p className="text-sm text-gray-400">Let others send connection requests</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.allowConnectionRequests}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowConnectionRequests: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>

                  <button
                    onClick={savePrivacySettings}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Appearance Settings</h2>
                    <p className="text-gray-400">Customize how the app looks</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={appearanceSettings.theme}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value as any })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <select
                      value={appearanceSettings.fontSize}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value as any })}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-gray-400">Show more content in less space</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appearanceSettings.compactMode}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <button
                    onClick={saveAppearanceSettings}
                    className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Appearance
                  </button>
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">General Settings</h2>
                    <p className="text-gray-400">Application preferences</p>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">Language</h3>
                    <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none">
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="lg">Luganda</option>
                    </select>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">Time Zone</h3>
                    <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none">
                      <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                      <option value="Africa/Lagos">West Africa Time (WAT)</option>
                      <option value="Africa/Johannesburg">South Africa Time (SAST)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">Date Format</h3>
                    <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <button className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Save General Settings
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
                    <p className="text-gray-400">Keep your account secure</p>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={changePassword}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Add an extra layer of security</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-500 text-sm">
                      <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including numbers, letters, and special characters.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Advanced Settings</h2>
                    <p className="text-gray-400">For power users</p>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">Data Export</h3>
                    <p className="text-sm text-gray-400 mb-4">Download all your data</p>
                    <button className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-green-500 transition-colors">
                      Export Data
                    </button>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">Developer Mode</h3>
                    <p className="text-sm text-gray-400 mb-4">Enable advanced debugging features</p>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-2">API Access</h3>
                    <p className="text-sm text-gray-400 mb-4">Generate API keys for integrations</p>
                    <button className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-green-500 transition-colors">
                      Generate API Key
                    </button>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h3 className="font-medium text-red-500 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all data</p>
                    <button className="px-6 py-2 bg-red-500/20 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Help Center</h2>
                    <p className="text-gray-400">Get support and assistance</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className="text-xl font-bold">ThinkTech Hub</h3>
                        <p className="text-gray-400">Your Innovation Partner</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-black rounded-lg">
                        <Phone className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-400">Phone Support</p>
                          <a href="tel:+256751668079" className="text-lg font-medium hover:text-green-500 transition-colors">
                            +256 751 668079
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-black rounded-lg">
                        <Mail className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-400">Email Support</p>
                          <a href="mailto:support@thinktechhub.com" className="text-lg font-medium hover:text-green-500 transition-colors">
                            support@thinktechhub.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black rounded-lg border border-gray-800 hover:border-green-500 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">FAQs</h3>
                      <p className="text-sm text-gray-400">Find answers to common questions</p>
                    </div>

                    <div className="p-4 bg-black rounded-lg border border-gray-800 hover:border-green-500 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">Documentation</h3>
                      <p className="text-sm text-gray-400">Learn how to use VersePass ID</p>
                    </div>

                    <div className="p-4 bg-black rounded-lg border border-gray-800 hover:border-green-500 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">Video Tutorials</h3>
                      <p className="text-sm text-gray-400">Watch step-by-step guides</p>
                    </div>

                    <div className="p-4 bg-black rounded-lg border border-gray-800 hover:border-green-500 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">Report a Bug</h3>
                      <p className="text-sm text-gray-400">Help us improve the platform</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-medium text-blue-400 mb-2">Support Hours</h3>
                    <p className="text-sm text-gray-400">Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
                    <p className="text-sm text-gray-400">Saturday: 9:00 AM - 2:00 PM EAT</p>
                    <p className="text-sm text-gray-400">Sunday: Closed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
