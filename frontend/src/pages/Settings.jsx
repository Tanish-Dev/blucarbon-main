import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key, 
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  PlayCircle
} from 'lucide-react';
import Chip from '../components/Chip';

export default function Settings() {
  const { resetTour } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: 'Dr. Sarah Chen',
      email: 's.chen@carbonvalidation.org',
      organization: 'Carbon Validation Institute',
      role: 'Lead Validator',
      bio: 'Marine biologist specializing in blue carbon ecosystems and remote sensing applications for coastal monitoring.',
      avatar: null
    },
    notifications: {
      emailNotifications: true,
      approvalRequests: true,
      dataUploads: false,
      systemUpdates: true,
      weeklyReports: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '8',
      apiKey: 'bc_sk_live_abc123def456ghi789jkl012mno345pqr678stu901vw',
      lastPasswordChange: '2024-01-01'
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'dd/mm/yyyy'
    }
  });

  const updateSettings = (section, updates) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const saveSettings = () => {
    // Mock save functionality
    console.log('Settings saved:', settings);
  };

  const generateNewApiKey = () => {
    const newKey = 'bc_sk_live_' + Math.random().toString(36).substring(2, 50);
    updateSettings('security', { apiKey: newKey });
  };

  const handleRestartTour = () => {
    resetTour();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#0A0F1C] leading-tight tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-lg text-[#475569]">
          Manage your account preferences and system configuration
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#E5EAF0] p-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="appearance"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-[#0A6BFF]" />
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-[#65728A]">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0A0F1C] font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => updateSettings('profile', { name: e.target.value })}
                    className="border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0A0F1C] font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings('profile', { email: e.target.value })}
                    className="border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-[#0A0F1C] font-medium">Organization</Label>
                  <Input
                    id="organization"
                    value={settings.profile.organization}
                    onChange={(e) => updateSettings('profile', { organization: e.target.value })}
                    className="border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#0A0F1C] font-medium">Role</Label>
                  <div className="pt-2">
                    <Chip>{settings.profile.role}</Chip>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#0A0F1C] font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => updateSettings('profile', { bio: e.target.value })}
                  className="min-h-[100px] border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">Email Notifications</h4>
                  <p className="text-sm text-[#475569]">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSettings('notifications', { emailNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">Approval Requests</h4>
                  <p className="text-sm text-[#475569]">Get notified when approvals are needed</p>
                </div>
                <Switch
                  checked={settings.notifications.approvalRequests}
                  onCheckedChange={(checked) => updateSettings('notifications', { approvalRequests: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">Data Uploads</h4>
                  <p className="text-sm text-[#475569]">Notify when new field data is uploaded</p>
                </div>
                <Switch
                  checked={settings.notifications.dataUploads}
                  onCheckedChange={(checked) => updateSettings('notifications', { dataUploads: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">System Updates</h4>
                  <p className="text-sm text-[#475569]">Important system and security updates</p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => updateSettings('notifications', { systemUpdates: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">Weekly Reports</h4>
                  <p className="text-sm text-[#475569]">Weekly summary of project activities</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => updateSettings('notifications', { weeklyReports: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                <div>
                  <h4 className="font-medium text-[#0A0F1C]">Two-Factor Authentication</h4>
                  <p className="text-sm text-[#475569]">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSettings('security', { twoFactorAuth: checked })}
                />
              </div>

              {/* Session Timeout */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#0A0F1C] font-medium">Session Timeout</Label>
                  <Select 
                    value={settings.security.sessionTimeout}
                    onValueChange={(value) => updateSettings('security', { sessionTimeout: value })}
                  >
                    <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#0A0F1C] font-medium">Last Password Change</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-[#475569]">{settings.security.lastPasswordChange}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-4">
                <Label className="text-[#0A0F1C] font-medium">API Key</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.security.apiKey}
                      readOnly
                      className="border-[#E5EAF0] rounded-xl font-mono text-sm pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button 
                    onClick={generateNewApiKey}
                    variant="outline"
                    className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-[#65728A]">
                  Keep your API key secure. It provides full access to your account.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-6">Appearance & Localization</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#0A0F1C] font-medium">Theme</Label>
                <Select 
                  value={settings.appearance.theme}
                  onValueChange={(value) => updateSettings('appearance', { theme: value })}
                >
                  <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#0A0F1C] font-medium">Language</Label>
                <Select 
                  value={settings.appearance.language}
                  onValueChange={(value) => updateSettings('appearance', { language: value })}
                >
                  <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#0A0F1C] font-medium">Timezone</Label>
                <Select 
                  value={settings.appearance.timezone}
                  onValueChange={(value) => updateSettings('appearance', { timezone: value })}
                >
                  <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</SelectItem>
                    <SelectItem value="UTC">UTC (UTC+00:00)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (UTC-05:00)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (UTC+00:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#0A0F1C] font-medium">Date Format</Label>
                <Select 
                  value={settings.appearance.dateFormat}
                  onValueChange={(value) => updateSettings('appearance', { dateFormat: value })}
                >
                  <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dashboard Tour Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <PlayCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A0F1C] mb-2">Dashboard Tour</h3>
                <p className="text-[#475569] mb-4">
                  Need a refresher? Restart the interactive dashboard tour to learn about all the features 
                  and how to make the most of the BluCarbon platform.
                </p>
                <Button 
                  onClick={handleRestartTour}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Restart Dashboard Tour
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline"
          className="border-[#E5EAF0] hover:border-[#D9E2EC] px-8 py-3"
        >
          Cancel
        </Button>
        <Button 
          onClick={saveSettings}
          className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-8 py-3"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}