import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  UserPlus, 
  Trash2, 
  Download, 
  FileText,
  Eye,
  AlertCircle,
  UserCheck,
  Settings,
  Activity
} from 'lucide-react';
import { mockValidators } from '../mock';
import Chip from '../components/Chip';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [newInvite, setNewInvite] = useState({ email: '', role: '' });

  const mockApprovals = [
    {
      id: 1,
      type: 'MRV Report',
      requester: 'Dr. Sarah Chen',
      projectId: 'GOD-001',
      age: '2 hours ago',
      status: 'pending',
      quorum: '2/3'
    },
    {
      id: 2,
      type: 'Credit Issuance',
      requester: 'CoastalCare NGO',
      projectId: 'TN-002',
      age: '1 day ago',
      status: 'pending',
      quorum: '1/3'
    },
    {
      id: 3,
      type: 'Project Registration',
      requester: 'Marine Foundation',
      projectId: 'KL-003',
      age: '3 days ago',
      status: 'approved',
      quorum: '3/3'
    }
  ];

  const mockRoles = [
    { id: 1, name: 'Dr. Sarah Chen', email: 's.chen@carbonvalidation.org', role: 'Validator', joinedAt: '2023-08-15' },
    { id: 2, name: 'Prof. Michael Rodriguez', email: 'm.rodriguez@bluecarbon.net', role: 'Lead Validator', joinedAt: '2023-06-20' },
    { id: 3, name: 'Priya Sharma', email: 'p.sharma@coastalcare.org', role: 'Project Manager', joinedAt: '2023-09-10' },
    { id: 4, name: 'James Wilson', email: 'j.wilson@nccr.gov', role: 'Admin', joinedAt: '2023-05-01' }
  ];

  const mockAuditLogs = [
    { id: 1, action: 'Credit issued', user: 'System', details: '25.0 tCO2e for GOD-001', timestamp: '2024-01-15 10:30:00' },
    { id: 2, action: 'MRV approved', user: 'Dr. Sarah Chen', details: 'Report v0.3 for GOD-001', timestamp: '2024-01-15 09:15:00' },
    { id: 3, action: 'Project registered', user: 'Priya Sharma', details: 'TN-002 Seagrass Conservation', timestamp: '2024-01-14 16:45:00' },
    { id: 4, action: 'User invited', user: 'James Wilson', details: 'Validator role to alex@validator.org', timestamp: '2024-01-14 14:20:00' },
    { id: 5, action: 'Data uploaded', user: 'Field Team', details: 'Batch 003 - 15 plots', timestamp: '2024-01-14 11:30:00' }
  ];

  const sendInvitation = () => {
    if (newInvite.email && newInvite.role) {
      // Mock invitation logic
      console.log('Invitation sent:', newInvite);
      setNewInvite({ email: '', role: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#0A0F1C] leading-tight tracking-tight mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg text-[#475569]">
          Manage system approvals, validators, and access control
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#E5EAF0] p-1 rounded-xl">
          <TabsTrigger 
            value="approvals" 
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <Shield className="w-4 h-4 mr-2" />
            Approvals
          </TabsTrigger>
          <TabsTrigger 
            value="validators"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Validators
          </TabsTrigger>
          <TabsTrigger 
            value="roles"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <User className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger 
            value="audit"
            className="data-[state=active]:bg-[#0A6BFF] data-[state=active]:text-white px-6 py-3 rounded-lg font-medium"
          >
            <Activity className="w-4 h-4 mr-2" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <div className="grid gap-6">
            {mockApprovals.map((approval) => (
              <div key={approval.id} className="bg-white border border-[#E5EAF0] rounded-2xl p-6 hover:border-[#D9E2EC] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-[#0A0F1C]">
                        {approval.type}
                      </h3>
                      <Chip 
                        status={approval.status === 'pending' ? 'In Review' : 'Monitoring'}
                        size="sm"
                      >
                        {approval.status}
                      </Chip>
                    </div>
                    
                    <div className="space-y-2 text-sm text-[#475569]">
                      <p><span className="font-medium">Requester:</span> {approval.requester}</p>
                      <p><span className="font-medium">Project:</span> {approval.projectId}</p>
                      <p><span className="font-medium">Submitted:</span> {approval.age}</p>
                      <p><span className="font-medium">Quorum:</span> {approval.quorum}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Diff
                      </Button>
                    </div>
                  </div>

                  {approval.status === 'pending' && (
                    <div className="flex gap-3 ml-6">
                      <Button
                        className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-4 py-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] px-4 py-2"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Validators Tab */}
        <TabsContent value="validators" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {mockValidators.map((validator) => (
              <div key={validator.id} className="bg-white border border-[#E5EAF0] rounded-2xl p-6 hover:border-[#D9E2EC] transition-colors">
                <div className="flex items-start gap-4">
                  <img 
                    src={validator.avatar} 
                    alt={validator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#0A0F1C]">{validator.name}</h3>
                      <Chip 
                        status={validator.availability === 'Available' ? 'Monitoring' : 'In Review'}
                        size="sm"
                      >
                        {validator.availability}
                      </Chip>
                    </div>
                    <p className="text-sm text-[#475569] mb-3">{validator.email}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {validator.skills.map((skill, index) => (
                        <Chip key={index} size="sm" variant="outline">
                          {skill}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Invite Section */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#0A0F1C] mb-4">Invite New Member</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0A0F1C] font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                  className="border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0A0F1C] font-medium">Role</Label>
                <Select onValueChange={(value) => setNewInvite(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="border-[#E5EAF0] rounded-xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="lead-validator">Lead Validator</SelectItem>
                    <SelectItem value="project-manager">Project Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={sendInvitation}
                  className="w-full bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#E5EAF0]">
              <h3 className="text-lg font-semibold text-[#0A0F1C]">Team Members</h3>
            </div>
            <div className="divide-y divide-[#E5EAF0]">
              {mockRoles.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#0A6BFF]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0A0F1C]">{member.name}</h4>
                      <p className="text-sm text-[#475569]">{member.email}</p>
                      <p className="text-xs text-[#65728A]">Joined {member.joinedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip size="sm">{member.role}</Chip>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#EF4444] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#E5EAF0] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0A0F1C]">System Activity Log</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7F8FA] border-b border-[#E5EAF0]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[#65728A]">Timestamp</th>
                    <th className="text-left p-4 text-sm font-medium text-[#65728A]">Action</th>
                    <th className="text-left p-4 text-sm font-medium text-[#65728A]">User</th>
                    <th className="text-left p-4 text-sm font-medium text-[#65728A]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF0]">
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="p-4 text-sm text-[#475569] font-mono">
                        {log.timestamp}
                      </td>
                      <td className="p-4">
                        <Chip size="sm" variant="outline">
                          {log.action}
                        </Chip>
                      </td>
                      <td className="p-4 text-sm font-medium text-[#0A0F1C]">
                        {log.user}
                      </td>
                      <td className="p-4 text-sm text-[#475569]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}