import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeatureProjectCard from '../components/FeatureProjectCard';
import ProjectMap from '../components/ProjectMap';
import DashboardTour from '../components/DashboardTour';
import { mockProject, mockActivity } from '../mock';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Upload, BarChart3, FileText, ShoppingCart, Clock, Loader2, FolderKanban, Award, TrendingUp, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, creditsAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hasCompletedTour, completeTour } = useAuth();
  const [stats, setStats] = useState({
    total_projects: 0,
    total_credits: 0,
    issued_credits: 0,
    pending_credits: 0
  });
  const [allProjects, setAllProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects and credits data
        const [projectsData, creditsStats] = await Promise.all([
          projectsAPI.getAll(),
          creditsAPI.getStats().catch(() => ({ total_credits: 0, issued_credits: 0, pending_credits: 0 }))
        ]);

        setAllProjects(projectsData);
        setRecentProjects(projectsData.slice(0, 3)); // Get 3 most recent projects
        setStats({
          total_projects: projectsData.length,
          ...creditsStats
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Start tour for first-time users after data loads
  useEffect(() => {
    if (!loading && !hasCompletedTour) {
      // Small delay to ensure DOM elements are ready
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, hasCompletedTour]);

  const handleTourComplete = () => {
    setRunTour(false);
    completeTour();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Active Dashboard
          </Badge>
        </div>
        <h1 className="text-2xl text-slate-600 font-normal">
          Welcome back,
        </h1>
        <p className="text-4xl md:text-5xl text-slate-900 font-bold mt-1 tracking-tight">
          {user?.full_name || user?.username || 'User'}
        </p>
        <p className="text-slate-500 mt-3">
          Track your carbon projects, manage credits, and make an environmental impact.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-slate-600">Total Projects</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.total_projects}</div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-sm font-medium text-slate-600">Methodologies</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{new Set(allProjects.map(p => p.methodology).filter(Boolean)).size}</div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-slate-600">Avg. Project Size</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{allProjects.length > 0 ? (allProjects.reduce((s, p) => s + (p.area_hectares || 0), 0) / allProjects.length).toFixed(0) : 0}<span className="text-base font-medium text-slate-500 ml-1">ha</span></div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-sm font-medium text-slate-600">Validation Rate</div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{allProjects.length > 0 ? Math.round((allProjects.filter(p => p.status !== 'draft').length / allProjects.length) * 100) : 0}<span className="text-base font-medium text-slate-500 ml-1">%</span></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 border-slate-200 hover:border-green-300 hover:bg-green-50 shadow-sm"
            onClick={() => navigate('/projects')}
          >
            <Upload className="w-5 h-5 text-green-600" />
            <div className="text-center">
              <div className="font-semibold text-slate-900">Register Project</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">Start new carbon project</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm"
            onClick={() => navigate('/field-capture')}
          >
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <div className="text-center">
              <div className="font-semibold text-slate-900">Upload Field Data</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">Sync measurement data</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 border-slate-200 hover:border-sky-300 hover:bg-sky-50 shadow-sm"
            onClick={() => navigate('/dmrv-studio')}
          >
            <FileText className="w-5 h-5 text-sky-600" />
            <div className="text-center">
              <div className="font-semibold text-slate-900">Run dMRV</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">Generate MRV report</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm"
            onClick={() => navigate('/marketplace')}
          >
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            <div className="text-center">
              <div className="font-semibold text-slate-900">Marketplace</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">Browse carbon credits</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Environmental Impact</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-slate-100">
          <div className="px-4 first:pl-0">
            <div className="text-sm text-slate-500 mb-1">Hectares Protected</div>
            <div className="text-2xl font-bold text-slate-900">{allProjects.reduce((sum, p) => sum + (p.area_hectares || 0), 0).toFixed(1)}</div>
          </div>
          <div className="px-4">
            <div className="text-sm text-slate-500 mb-1">Ecosystem Types</div>
            <div className="text-2xl font-bold text-slate-900">{new Set(allProjects.map(p => p.ecosystem_type).filter(Boolean)).size}</div>
          </div>
          <div className="px-4">
            <div className="text-sm text-slate-500 mb-1">Blockchain Verified</div>
            <div className="text-2xl font-bold text-slate-900">{allProjects.filter(p => p.blockchain_hash).length}</div>
          </div>
          <div className="px-4">
            <div className="text-sm text-slate-500 mb-1">Est. tCO2e Potential</div>
            <div className="text-2xl font-bold text-slate-900">{allProjects.reduce((sum, p) => sum + (p.metrics?.co2_absorbed || p.metrics?.estimated_credits || 0), 0).toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* 50/50 Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Locations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Locations</h3>
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden min-h-[240px] relative">
            <ProjectMap projects={recentProjects} />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm text-xs space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Mangrove</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-400"></div>Seagrass</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-600"></div>Salt Marsh</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Total Projects</div>
              <div className="font-semibold text-slate-900">{stats.total_projects}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Hectares</div>
              <div className="font-semibold text-slate-900">{allProjects.reduce((sum, p) => sum + (p.area_hectares || 0), 0).toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Credits Issued</div>
              <div className="font-semibold text-slate-900">{stats.issued_credits}</div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
            {recentProjects.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-blue-600 hover:text-blue-700">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
          {recentProjects.length > 0 ? (
            <div className="flex-1 space-y-3">
              {recentProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      project.status === 'monitoring' ? 'bg-amber-400' :
                      project.status === 'issued' ? 'bg-emerald-500' :
                      project.status === 'in_review' ? 'bg-blue-400' :
                      project.status === 'rejected' ? 'bg-red-400' : 'bg-slate-200'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{project.title}</p>
                      <p className="text-xs text-slate-500">{project.ecosystem_type} • {project.area_hectares} ha</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${
                    project.status === 'monitoring' ? 'bg-amber-50 text-amber-700' :
                    project.status === 'issued' ? 'bg-emerald-50 text-emerald-700' :
                    project.status === 'in_review' ? 'bg-blue-50 text-blue-700' :
                    project.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {(project.status || 'draft').replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium mb-1">No projects yet</p>
              <p className="text-sm text-slate-500 mb-4">Create your first project to get started</p>
              <Button 
                size="sm"
                onClick={() => navigate('/projects')}
                className="bg-[#00e07a] hover:bg-[#00b86b] text-black font-medium"
              >
                Register Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 50/50 Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Pipeline</h3>
          <div className="space-y-3 mb-6">
            {[
              { key: 'draft', label: 'Draft', color: 'bg-slate-200' },
              { key: 'in_review', label: 'In Review', color: 'bg-blue-400' },
              { key: 'monitoring', label: 'Monitoring', color: 'bg-amber-400' },
              { key: 'issued', label: 'Issued', color: 'bg-emerald-500' },
              { key: 'rejected', label: 'Rejected', color: 'bg-red-400' },
            ].map(stage => {
              const count = allProjects.filter(p => (p.status || 'draft') === stage.key).length;
              return (
                <div key={stage.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 ${stage.color} rounded-full`}></div>
                    <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">{count}</Badge>
                </div>
              );
            })}
          </div>
          {allProjects.length > 0 ? (
            <div className="pt-4 border-t border-slate-100">
              <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                {['draft', 'in_review', 'monitoring', 'issued', 'rejected'].map(status => {
                  const count = allProjects.filter(p => (p.status || 'draft') === status).length;
                  const pct = allProjects.length > 0 ? (count / allProjects.length) * 100 : 0;
                  const colors = { draft: 'bg-slate-300', in_review: 'bg-blue-400', monitoring: 'bg-amber-400', issued: 'bg-emerald-500', rejected: 'bg-red-400' };
                  return pct > 0 ? <div key={status} className={`${colors[status]} h-2`} style={{ width: `${pct}%` }} /> : null;
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">{allProjects.length} project{allProjects.length !== 1 ? 's' : ''} in pipeline</p>
            </div>
          ) : (
            <div className="text-center py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">No projects in pipeline yet</p>
            </div>
          )}
        </div>

        {/* Blockchain & Verification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Blockchain & Verification</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Network</span>
              <span className="text-sm font-medium text-slate-900">Polygon Mumbai Testnet</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Smart Contracts</span>
              <span className="text-sm font-medium text-slate-900">Solidity</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">MRV Registry</span>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Projects Verified</div>
              <div className="text-xl font-bold text-slate-900">{allProjects.filter(p => p.status === 'monitoring' || p.status === 'issued').length}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Credits Issued</div>
              <div className="text-xl font-bold text-slate-900">{stats.issued_credits}</div>
            </div>
          </div>

          <div className="text-center py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">{allProjects.filter(p => p.blockchain_hash).length > 0 ? `${allProjects.filter(p => p.blockchain_hash).length} transaction(s) recorded` : 'No blockchain activity yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}