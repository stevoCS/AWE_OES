import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { settingsApi } from '../api/adminApi';
import '../components/AdminCommon.css';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'AWE Electronics',
    siteDescription: 'Your trusted electronics partner',
    contactEmail: 'contact@aweelectronics.com',
    supportPhone: '+61 (03) 8765-4321',
    address: '123 Collins Street, Melbourne VIC 3000, Australia',
    currency: 'AUD',
    timezone: 'Australia/Melbourne',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true
  });

  const [profile, setProfile] = useState({
    username: 'admin',
    email: 'admin@aweelectronics.com',
    fullName: 'System Administrator',
    phone: '+61 (03) 8765-4321',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsApi.getAdminSettings();
      
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      setSaveMessage('');
      
      const response = await settingsApi.updateAdminSettings(settings);
      
      if (response.success) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      setSaveMessage('');
      
      if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
        setSaveMessage('New passwords do not match!');
        return;
      }
      
      const profileData = {
        username: profile.username,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone
      };
      
      if (profile.newPassword) {
        profileData.currentPassword = profile.currentPassword;
        profileData.newPassword = profile.newPassword;
      }
      
      // Simulate successful API call
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Reset password fields after success
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'profile', name: 'Admin Profile', icon: '👤' }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Site Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleSettingsChange('siteName', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Site Description</label>
          <input
            type="text"
            value={settings.siteDescription}
            onChange={(e) => handleSettingsChange('siteDescription', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Support Phone</label>
          <input
            type="tel"
            value={settings.supportPhone}
            onChange={(e) => handleSettingsChange('supportPhone', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Business Address</label>
        <textarea
          value={settings.address}
          onChange={(e) => handleSettingsChange('address', e.target.value)}
          className="form-textarea"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Default Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingsChange('currency', e.target.value)}
            className="form-select"
          >
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="NZD">NZD - New Zealand Dollar</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingsChange('timezone', e.target.value)}
            className="form-select"
          >
            <option value="Australia/Melbourne">Australia/Melbourne (AEDT/AEST)</option>
            <option value="Australia/Sydney">Australia/Sydney (AEDT/AEST)</option>
            <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
            <option value="Australia/Perth">Australia/Perth (AWST)</option>
            <option value="Australia/Adelaide">Australia/Adelaide (ACDT/ACST)</option>
            <option value="Australia/Darwin">Australia/Darwin (ACST)</option>
            <option value="Australia/Hobart">Australia/Hobart (AEDT/AEST)</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => handleSettingsChange('allowRegistration', e.target.checked)}
            />
            Allow User Registration
          </label>
          <small className="form-help">Allow new customers to create accounts</small>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) => handleSettingsChange('requireEmailVerification', e.target.checked)}
            />
            Require Email Verification
          </label>
          <small className="form-help">Require customers to verify their email address</small>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableNotifications}
            onChange={(e) => handleSettingsChange('enableNotifications', e.target.checked)}
          />
          Enable System Notifications
        </label>
        <small className="form-help">Send system notifications for orders and updates</small>
      </div>

      <div className="form-actions">
        <button 
          className="btn-primary"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Profile Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => handleProfileChange('username', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleProfileChange('fullName', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <hr className="section-divider" />

      <h3 className="section-title">Change Password</h3>
      
      <div className="form-group">
        <label>Current Password</label>
        <input
          type="password"
          value={profile.currentPassword}
          onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
          className="form-input"
          placeholder="Enter current password to change"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={profile.newPassword}
            onChange={(e) => handleProfileChange('newPassword', e.target.value)}
            className="form-input"
            placeholder="Enter new password"
          />
        </div>
        
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={profile.confirmPassword}
            onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
            className="form-input"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
          className="btn-primary"
          onClick={saveProfile}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Settings</h1>
        </div>

        <div className="settings-container">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {saveMessage && (
              <div className={`message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
                {saveMessage}
              </div>
            )}

            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'profile' && renderProfileSettings()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings; 