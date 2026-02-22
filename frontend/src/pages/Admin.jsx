import React, { useState, useEffect } from 'react';
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
  Activity,
  Loader2,
  Hash,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { mockValidators } from '../mock';
import Chip from '../components/Chip';
import { projectsAPI, validationAPI } from '../services/api';
import { toast } from '../hooks/use-toast';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [newInvite, setNewInvite] = useState({ email: '', role: '' });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);
  const [mrvReports, setMrvReports] = useState({});
  const [mrvLoading, setMrvLoading] = useState({});

  // Load real projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      setActionLoading(prev => ({ ...prev, [projectId]: 'approving' }));
      await validationAPI.approveProject(projectId, 'Approved by admin');
      toast({ title: 'Project Approved', description: 'Project status updated to monitoring.' });
      await loadProjects();
    } catch (error) {
      console.error('Failed to approve project:', error);
      const detail = error.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(', ') : 'Failed to approve project';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: null }));
    }
  };

  const handleReject = async (projectId) => {
    try {
      setActionLoading(prev => ({ ...prev, [projectId]: 'rejecting' }));
      await validationAPI.rejectProject(projectId, 'Rejected by admin');
      toast({ title: 'Project Rejected', description: 'Project has been rejected.' });
      await loadProjects();
    } catch (error) {
      console.error('Failed to reject project:', error);
      const detail = error.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(', ') : 'Failed to reject project';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: null }));
    }
  };

  const toggleExpandProject = async (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      return;
    }
    setExpandedProject(projectId);
    // Fetch MRV report if not already loaded
    if (!mrvReports[projectId]) {
      try {
        setMrvLoading(prev => ({ ...prev, [projectId]: true }));
        const report = await validationAPI.getMRVReport(projectId);
        setMrvReports(prev => ({ ...prev, [projectId]: report }));
      } catch (error) {
        // 404 means no report — that's fine
        if (error.response?.status === 404) {
          setMrvReports(prev => ({ ...prev, [projectId]: null }));
        } else {
          console.error('Failed to load MRV report:', error);
        }
      } finally {
        setMrvLoading(prev => ({ ...prev, [projectId]: false }));
      }
    }
  };

  const getStatusChipStatus = (status) => {
    const map = {
      draft: 'Draft',
      in_review: 'In Review',
      monitoring: 'Monitoring',
      issued: 'Issued',
      rejected: 'Rejected'
    };
    return map[status] || status;
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0A6BFF]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-[#E5EAF0] rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-[#65728A] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0A0F1C] mb-2">No projects found</h3>
              <p className="text-[#65728A]">No projects are available for review.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => {
                const projectId = project.id || project._id;
                const isExpanded = expandedProject === projectId;
                const report = mrvReports[projectId];
                const isReportLoading = mrvLoading[projectId];
                const isPending = ['draft', 'in_review'].includes(project.status);

                return (
                  <div key={projectId} className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden hover:border-[#D9E2EC] transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-[#0A0F1C]">
                              {project.title || 'Untitled Project'}
                            </h3>
                            <Chip 
                              status={getStatusChipStatus(project.status)}
                              size="sm"
                            >
                              {project.status || 'draft'}
                            </Chip>
                          </div>
                          
                          <div className="space-y-2 text-sm text-[#475569]">
                            <p><span className="font-medium">Ecosystem:</span> {project.ecosystem_type || 'N/A'}</p>
                            <p><span className="font-medium">Methodology:</span> {project.methodology || 'N/A'}</p>
                            <p><span className="font-medium">Area:</span> {project.area_hectares || 0} hectares</p>
                            <p><span className="font-medium">Created:</span> {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</p>
                            {project.description && (
                              <p><span className="font-medium">Description:</span> {project.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                              onClick={() => toggleExpandProject(projectId)}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                              {isExpanded ? 'Hide Report' : 'View MRV Report'}
                            </Button>
                          </div>
                        </div>

                        {isPending && (
                          <div className="flex gap-3 ml-6">
                            <Button
                              className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-4 py-2"
                              onClick={() => handleApprove(projectId)}
                              disabled={!!actionLoading[projectId]}
                            >
                              {actionLoading[projectId] === 'approving' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] px-4 py-2"
                              onClick={() => handleReject(projectId)}
                              disabled={!!actionLoading[projectId]}
                            >
                              {actionLoading[projectId] === 'rejecting' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MRV Report Section (expandable) */}
                    {isExpanded && (
                      <div className="border-t border-[#E5EAF0] bg-[#F7F8FA] p-6">
                        <h4 className="font-semibold text-[#0A0F1C] mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0A6BFF]" />
                          dMRV Report
                        </h4>
                        {isReportLoading ? (
                          <div className="flex items-center gap-2 text-[#65728A]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading report...
                          </div>
                        ) : report ? (
                          <div className="space-y-4">
                            {/* Key Results */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0]">
                                <p className="text-xs text-[#65728A] mb-1">CO₂ Absorbed</p>
                                <p className="text-xl font-bold text-[#10B981]">
                                  {report.analysis_data?.co2?.toFixed(1) || 0} <span className="text-sm font-normal">tCO2e</span>
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0]">
                                <p className="text-xs text-[#65728A] mb-1">Confidence</p>
                                <p className="text-xl font-bold text-[#F59E0B]">
                                  {((report.analysis_data?.confidence || 0) * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0]">
                                <p className="text-xs text-[#65728A] mb-1">Carbon Stock</p>
                                <p className="text-xl font-bold text-[#0A6BFF]">
                                  {report.analysis_data?.carbonStock?.toFixed(1) || 0} <span className="text-sm font-normal">tC</span>
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0]">
                                <p className="text-xs text-[#65728A] mb-1">Area Change</p>
                                <p className="text-xl font-bold text-[#0A0F1C]">
                                  +{report.analysis_data?.areaChange?.toFixed(1) || 0} <span className="text-sm font-normal">ha</span>
                                </p>
                              </div>
                            </div>

                            {/* Report Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0] space-y-2 text-sm">
                                <p><span className="font-medium text-[#0A0F1C]">Biomass Increase:</span> <span className="text-[#475569]">{report.analysis_data?.biomass?.toFixed(1) || 0}%</span></p>
                                <p><span className="font-medium text-[#0A0F1C]">NDVI Change:</span> <span className="text-[#475569]">+{report.analysis_data?.ndvi?.toFixed(3) || 0}</span></p>
                                <p><span className="font-medium text-[#0A0F1C]">Baseline Date:</span> <span className="text-[#475569]">{report.analysis_data?.baseline_date || 'N/A'}</span></p>
                                <p><span className="font-medium text-[#0A0F1C]">Monitoring Date:</span> <span className="text-[#475569]">{report.analysis_data?.monitoring_date || 'N/A'}</span></p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0] space-y-2 text-sm">
                                <p><span className="font-medium text-[#0A0F1C]">Report Date:</span> <span className="text-[#475569]">{report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}</span></p>
                                <p><span className="font-medium text-[#0A0F1C]">Blockchain Status:</span>{' '}
                                  <Chip size="sm" status={report.blockchain_status === 'confirmed' ? 'Monitoring' : 'In Review'}>
                                    {report.blockchain_status || 'pending'}
                                  </Chip>
                                </p>
                                {report.blockchain_tx_hash && (
                                  <p><span className="font-medium text-[#0A0F1C]">TX Hash:</span> <code className="text-xs text-[#475569] break-all">{report.blockchain_tx_hash}</code></p>
                                )}
                                {report.validator_notes && (
                                  <p><span className="font-medium text-[#0A0F1C]">Validator Notes:</span> <span className="text-[#475569]">{report.analysis_data?.validationNotes || report.validator_notes}</span></p>
                                )}
                              </div>
                            </div>

                            {/* MRV Hash */}
                            {report.mrv_hash && (
                              <div className="bg-white rounded-xl p-4 border border-[#E5EAF0] text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <Hash className="w-4 h-4 text-[#65728A]" />
                                  <span className="text-sm font-medium text-[#65728A]">MRV Hash</span>
                                </div>
                                <code className="text-xs text-[#0A0F1C] bg-[#F7F8FA] px-3 py-1 rounded font-mono break-all">
                                  {report.mrv_hash}
                                </code>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-8 border border-[#E5EAF0] text-center">
                            <AlertCircle className="w-8 h-8 text-[#65728A] mx-auto mb-3" />
                            <p className="text-[#0A0F1C] font-medium mb-1">No MRV report generated yet</p>
                            <p className="text-sm text-[#65728A]">An MRV report will appear here once generated in the dMRV Studio.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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