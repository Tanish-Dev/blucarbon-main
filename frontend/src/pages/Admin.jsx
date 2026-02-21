import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../components/ui/use-toast';
import { adminAPI } from '../services/api';
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
  Hash,
  Leaf,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { mockValidators } from '../mock';
import Chip from '../components/Chip';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [newInvite, setNewInvite] = useState({ email: '', role: '' });
  const [approvals, setApprovals] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});
  const [showRejectInput, setShowRejectInput] = useState(null);

  const loadApprovals = useCallback(async () => {
    setLoadingApprovals(true);
    try {
      const data = await adminAPI.getPendingApprovals();
      setApprovals(data.approvals || []);
    } catch (error) {
      console.error('Error loading approvals:', error);
      // Fallback: show empty state
      setApprovals([]);
    } finally {
      setLoadingApprovals(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'approvals') {
      loadApprovals();
    }
  }, [activeTab, loadApprovals]);

  const handleApprove = async (projectId) => {
    setProcessingId(projectId);
    try {
      await adminAPI.approveProject(projectId, 'Approved by admin');
      toast({
        title: "✅ Project Approved",
        description: "Project has been approved and moved to monitoring phase."
      });
      loadApprovals();
    } catch (error) {
      console.error('Error approving project:', error);
      toast({
        title: "Error",
        description: "Failed to approve project. " + (error.response?.data?.detail || error.message),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (projectId) => {
    const notes = rejectNotes[projectId] || '';
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(projectId);
    try {
      await adminAPI.rejectProject(projectId, notes);
      toast({
        title: "Project Returned",
        description: "Project has been sent back to draft for revision."
      });
      setShowRejectInput(null);
      setRejectNotes(prev => ({ ...prev, [projectId]: '' }));
      loadApprovals();
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast({
        title: "Error",
        description: "Failed to reject project. " + (error.response?.data?.detail || error.message),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
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
            {approvals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {approvals.length}
              </span>
            )}
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

        {/* ===== Approvals Tab ===== */}
        <TabsContent value="approvals" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#0A0F1C]">
              Pending MRV Report Approvals
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadApprovals}
              disabled={loadingApprovals}
              className="border-[#E5EAF0] hover:border-[#D9E2EC]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingApprovals ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {loadingApprovals && (
            <div className="bg-white border border-[#E5EAF0] rounded-2xl p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#0A6BFF] animate-spin mx-auto mb-3" />
              <p className="text-[#475569]">Loading pending approvals...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingApprovals && approvals.length === 0 && (
            <div className="bg-white border border-[#E5EAF0] rounded-2xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#0A0F1C] mb-2">All caught up!</h3>
              <p className="text-[#475569]">
                No MRV reports are waiting for your approval. Reports submitted from the dMRV Studio will appear here.
              </p>
            </div>
          )}

          {/* Approval Cards */}
          {!loadingApprovals && approvals.length > 0 && (
            <div className="grid gap-6">
              {approvals.map((item) => {
                const project = item.project;
                const report = item.mrv_report;
                const validator = item.validator;
                const isExpanded = expandedId === project.id;
                const isProcessing = processingId === project.id;
                const isRejectMode = showRejectInput === project.id;

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden hover:border-[#D9E2EC] transition-all"
                  >
                    {/* Card Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-amber-100 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-[#0A0F1C]">
                                {project.title}
                              </h3>
                              <p className="text-sm text-[#475569]">MRV Report — Awaiting Approval</p>
                            </div>
                            <Chip status="In Review" size="sm">Pending</Chip>
                          </div>

                          {/* Quick Info Row */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569] mb-4">
                            <span className="flex items-center gap-1">
                              <Leaf className="w-3.5 h-3.5" />
                              {project.ecosystem_type || 'Blue Carbon'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {project.area_hectares || 0} ha
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Submitted {formatDate(item.submitted_at)}
                            </span>
                            {validator && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                Validated by {validator.full_name}
                              </span>
                            )}
                          </div>

                          {/* Analysis Summary (always visible) */}
                          {report?.analysis_data && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="bg-[#F0FDF4] rounded-xl p-3">
                                <p className="text-xs text-[#65728A] mb-1">CO₂ Absorbed</p>
                                <p className="text-lg font-bold text-[#10B981]">
                                  {report.analysis_data.co2?.toFixed(1) || 0}
                                  <span className="text-xs font-normal ml-1">tCO2e</span>
                                </p>
                              </div>
                              <div className="bg-[#EFF6FF] rounded-xl p-3">
                                <p className="text-xs text-[#65728A] mb-1">Area Change</p>
                                <p className="text-lg font-bold text-[#0A6BFF]">
                                  +{report.analysis_data.areaChange?.toFixed(1) || 0}
                                  <span className="text-xs font-normal ml-1">ha</span>
                                </p>
                              </div>
                              <div className="bg-[#FFF7ED] rounded-xl p-3">
                                <p className="text-xs text-[#65728A] mb-1">Biomass</p>
                                <p className="text-lg font-bold text-[#F59E0B]">
                                  +{report.analysis_data.biomass?.toFixed(1) || 0}
                                  <span className="text-xs font-normal ml-1">%</span>
                                </p>
                              </div>
                              <div className="bg-[#F5F3FF] rounded-xl p-3">
                                <p className="text-xs text-[#65728A] mb-1">Confidence</p>
                                <p className="text-lg font-bold text-[#7C3AED]">
                                  {((report.analysis_data.confidence || 0) * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Expand/Collapse */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : project.id)}
                            className="flex items-center gap-1 text-sm text-[#0A6BFF] hover:underline"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide Details' : 'View Full Report'}
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-6">
                          <Button
                            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-5"
                            onClick={() => handleApprove(project.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] px-5"
                            onClick={() => setShowRejectInput(isRejectMode ? null : project.id)}
                            disabled={isProcessing}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>

                      {/* Reject Notes Input */}
                      {isRejectMode && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <Label className="text-sm font-medium text-red-800 mb-2 block">
                            Rejection Reason (required)
                          </Label>
                          <Textarea
                            placeholder="Explain why this report needs revision..."
                            value={rejectNotes[project.id] || ''}
                            onChange={(e) => setRejectNotes(prev => ({ ...prev, [project.id]: e.target.value }))}
                            className="border-red-200 mb-3"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
                              onClick={() => handleReject(project.id)}
                              disabled={isProcessing}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRejectInput(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && report && (
                      <div className="border-t border-[#E5EAF0] bg-[#F7F8FA] p-6 space-y-4">
                        {/* MRV Hash */}
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-[#0A6BFF]" />
                          <span className="text-sm font-medium text-[#0A0F1C]">MRV Hash:</span>
                          <code className="text-xs bg-white border border-[#E5EAF0] px-3 py-1.5 rounded-lg font-mono text-[#475569] break-all flex-1">
                            {report.mrv_hash || 'Not generated'}
                          </code>
                        </div>

                        {/* Blockchain Status */}
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-[#7C3AED]" />
                          <span className="text-sm font-medium text-[#0A0F1C]">Blockchain:</span>
                          <Chip size="sm" status={
                            report.blockchain_status === 'confirmed' ? 'Monitoring' :
                              report.blockchain_status === 'pending' ? 'In Review' : 'Draft'
                          }>
                            {report.blockchain_status || 'Unknown'}
                          </Chip>
                          {report.blockchain_tx_hash && (
                            <a
                              href={report.blockchain_explorer_url || `https://mumbai.polygonscan.com/tx/${report.blockchain_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#0A6BFF] hover:underline flex items-center gap-1"
                            >
                              View on PolygonScan <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Validation Notes */}
                        {report.analysis_data?.validationNotes && (
                          <div>
                            <span className="text-sm font-medium text-[#0A0F1C] block mb-1">Validator Notes:</span>
                            <p className="text-sm text-[#475569] bg-white border border-[#E5EAF0] rounded-lg p-3">
                              {report.analysis_data.validationNotes}
                            </p>
                          </div>
                        )}

                        {/* Detailed Metrics */}
                        {report.analysis_data && (
                          <div>
                            <span className="text-sm font-medium text-[#0A0F1C] block mb-2">Full Analysis Data:</span>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-white border border-[#E5EAF0] rounded-lg p-3">
                                <p className="text-xs text-[#65728A]">NDVI Change</p>
                                <p className="font-semibold text-[#0A0F1C]">{report.analysis_data.ndvi || 0}</p>
                              </div>
                              <div className="bg-white border border-[#E5EAF0] rounded-lg p-3">
                                <p className="text-xs text-[#65728A]">Carbon Stock</p>
                                <p className="font-semibold text-[#0A0F1C]">{report.analysis_data.carbonStock || 0} tC</p>
                              </div>
                              <div className="bg-white border border-[#E5EAF0] rounded-lg p-3">
                                <p className="text-xs text-[#65728A]">Baseline Date</p>
                                <p className="font-semibold text-[#0A0F1C]">{report.analysis_data.baseline_date || '—'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Report Created */}
                        <div className="text-xs text-[#65728A]">
                          Report ID: {report.id} • Created: {report.created_at ? new Date(report.created_at).toLocaleString() : 'Unknown'}
                        </div>
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