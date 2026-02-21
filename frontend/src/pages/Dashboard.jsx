import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeatureProjectCard from '../components/FeatureProjectCard';
import ProjectMap from '../components/ProjectMap';
import DashboardTour from '../components/DashboardTour';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Upload, BarChart3, FileText, ShoppingCart, Clock, Loader2,
  FolderKanban, Award, TrendingUp, Activity, ArrowUpRight,
  Sparkles, Leaf, Globe, Shield, Hash, CheckCircle, AlertCircle,
  TreeDeciduous, Waves, Calendar, ExternalLink
} from 'lucide-react';
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
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
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

  // Compute dashboard analytics from real data
  const projectsByStatus = allProjects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const totalArea = allProjects.reduce((sum, p) => sum + (p.area_hectares || 0), 0);
  const projectsByEcosystem = allProjects.reduce((acc, p) => {
    const type = p.ecosystem_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const blockchainVerified = allProjects.filter(p => p.blockchain_hash).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Tour */}
      <DashboardTour run={runTour} onComplete={handleTourComplete} />

      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full filter blur-3xl opacity-30 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-100 rounded-full filter blur-3xl opacity-30 -ml-32 -mb-32"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
              <Sparkles className="w-3 h-3 mr-1" />
              Active Dashboard
            </Badge>
            {blockchainVerified > 0 && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                <Shield className="w-3 h-3 mr-1" />
                {blockchainVerified} Blockchain Verified
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            Welcome back,
          </h1>
          <p className="text-4xl md:text-6xl text-slate-900 font-bold max-w-2xl tracking-tight bg-clip-text">
            {user?.full_name || user?.username || 'User'}
          </p>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl">
            Track your carbon projects, manage credits, and make an environmental impact.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" data-tour="stats">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full filter blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderKanban className="w-4 h-4 text-blue-600" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 opacity-60" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5">
              {stats.total_projects}
            </div>
            <div className="text-xs font-medium text-slate-600">
              Total Projects
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-full filter blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5">
              {stats.total_credits}
            </div>
            <div className="text-xs font-medium text-slate-600">
              Total Credits (tCO2e)
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full filter blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-purple-500 opacity-60" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5">
              {stats.issued_credits}
            </div>
            <div className="text-xs font-medium text-slate-600">
              Issued Credits
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-full filter blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <Activity className="w-3.5 h-3.5 text-amber-500 opacity-60" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5">
              {stats.pending_credits}
            </div>
            <div className="text-xs font-medium text-slate-600">
              Pending Credits
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm" data-tour="quick-actions">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
            Quick Actions
          </h3>
          <Badge variant="outline" className="text-slate-600">
            {4} available
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="group h-auto p-6 flex-col gap-3 border-slate-200 hover:border-green-300 hover:bg-green-50 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/projects')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">Register Project</div>
                <div className="text-sm text-slate-600 mt-1">Start new carbon project</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>
          </Button>

          <Button
            variant="outline"
            className="group h-auto p-6 flex-col gap-3 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/field-capture')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">Upload Field Data</div>
                <div className="text-sm text-slate-600 mt-1">Sync measurement data</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>
          </Button>

          <Button
            variant="outline"
            className="group h-auto p-6 flex-col gap-3 border-slate-200 hover:border-sky-300 hover:bg-sky-50 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/dmrv-studio')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors">
                <FileText className="w-6 h-6 text-sky-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">Run dMRV</div>
                <div className="text-sm text-slate-600 mt-1">Generate MRV report</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>
          </Button>

          <Button
            variant="outline"
            className="group h-auto p-6 flex-col gap-3 border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/marketplace')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">Marketplace</div>
                <div className="text-sm text-slate-600 mt-1">Browse carbon credits</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>
          </Button>
        </div>
      </div>

      {/* Environmental Impact Summary — NEW SECTION */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-2xl p-6 md:p-8 shadow-sm" data-tour="impact">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Globe className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
              Environmental Impact
            </h3>
            <p className="text-sm text-slate-600">Your contributions to blue carbon ecosystems</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/50">
            <div className="p-2 bg-emerald-100 rounded-lg w-fit mx-auto mb-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {totalArea.toFixed(0)}
            </div>
            <div className="text-sm text-slate-600 mt-1">Hectares Protected</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/50">
            <div className="p-2 bg-sky-100 rounded-lg w-fit mx-auto mb-3">
              <Waves className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {Object.keys(projectsByEcosystem).length}
            </div>
            <div className="text-sm text-slate-600 mt-1">Ecosystem Types</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/50">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {blockchainVerified}
            </div>
            <div className="text-sm text-slate-600 mt-1">Blockchain Verified</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/50">
            <div className="p-2 bg-amber-100 rounded-lg w-fit mx-auto mb-3">
              <TreeDeciduous className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {(totalArea * 3.67).toFixed(0)}
            </div>
            <div className="text-sm text-slate-600 mt-1">Est. tCO2e Potential</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Enhanced Map Component */}
        <div className="lg:col-span-1" data-tour="project-map">
          <ProjectMap />
        </div>

        {/* Enhanced Recent Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm" data-tour="recent-projects">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
              Recent Projects
            </h3>
            {recentProjects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl hover:from-emerald-50 hover:shadow-sm transition-all duration-200 cursor-pointer border border-transparent hover:border-emerald-100"
                  onClick={() => navigate('/projects')}
                >
                  {/* Project Image Thumbnail */}
                  {project.images && project.images.length > 0 ? (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-sky-50">
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-emerald-100 flex items-center justify-center"><svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <FolderKanban className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-900 font-semibold leading-tight group-hover:text-emerald-700 transition-colors">
                        {project.title}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {project.ecosystem_type}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{project.area_hectares} hectares</span>
                      {project.images && project.images.length > 0 && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-purple-600 font-medium">{project.images.length} {project.images.length === 1 ? 'photo' : 'photos'}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600 transition-all" />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium mb-1">No projects yet</p>
                <p className="text-sm text-slate-500 mb-4">Create your first project to get started</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/projects')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Register Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Pipeline & Blockchain Status — NEW SECTION */}
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Project Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Project Pipeline
          </h3>
          <div className="space-y-4">
            {[
              { status: 'draft', label: 'Draft', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
              { status: 'in_review', label: 'In Review', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
              { status: 'monitoring', label: 'Monitoring', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
              { status: 'issued', label: 'Issued', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
              { status: 'rejected', label: 'Rejected', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
            ].map(item => {
              const count = projectsByStatus[item.status] || 0;
              const percentage = allProjects.length > 0 ? (count / allProjects.length) * 100 : 0;
              return (
                <div key={item.status} className={`flex items-center justify-between p-3 rounded-xl ${item.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className={`font-medium text-sm ${item.textColor}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={`font-bold text-sm ${item.textColor} w-6 text-right`}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {allProjects.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No projects in pipeline yet</p>
            </div>
          )}
        </div>

        {/* Blockchain & Verification Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Blockchain & Verification
          </h3>
          <div className="space-y-4">
            {/* System Status */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-900">Network</span>
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  Polygon Mumbai Testnet
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-900">Smart Contracts</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Solidity
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">MRV Registry</span>
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  <Hash className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">{blockchainVerified}</div>
                <div className="text-xs text-emerald-600 mt-1">Projects Verified</div>
              </div>
              <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-100">
                <div className="text-2xl font-bold text-sky-700">{stats.issued_credits}</div>
                <div className="text-xs text-sky-600 mt-1">Credits Issued</div>
              </div>
            </div>

            {/* Recent blockchain activity */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Blockchain Activity</h4>
              {allProjects.filter(p => p.blockchain_hash).length > 0 ? (
                <div className="space-y-2">
                  {allProjects.filter(p => p.blockchain_hash).slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">{p.blockchain_hash?.slice(0, 24)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No blockchain records yet</p>
                  <p className="text-xs text-slate-400 mt-1">Approve projects in dMRV Studio to create on-chain records</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Distribution — NEW SECTION */}
      {Object.keys(projectsByEcosystem).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-emerald-600" />
            Ecosystem Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(projectsByEcosystem).map(([type, count]) => {
              const isMangrove = type.toLowerCase().includes('mangrove');
              const isSeagrass = type.toLowerCase().includes('seagrass');
              const areaForType = allProjects
                .filter(p => p.ecosystem_type === type)
                .reduce((sum, p) => sum + (p.area_hectares || 0), 0);

              return (
                <div key={type} className={`rounded-xl p-5 border ${isMangrove ? 'bg-emerald-50 border-emerald-100' :
                  isSeagrass ? 'bg-sky-50 border-sky-100' :
                    'bg-violet-50 border-violet-100'
                  }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isMangrove ? 'bg-emerald-100' :
                      isSeagrass ? 'bg-sky-100' :
                        'bg-violet-100'
                      }`}>
                      {isMangrove ? <TreeDeciduous className="w-5 h-5 text-emerald-600" /> :
                        isSeagrass ? <Waves className="w-5 h-5 text-sky-600" /> :
                          <Leaf className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{type}</h4>
                      <p className="text-xs text-slate-600">{count} project{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Area:</span>
                      <span className="font-medium text-slate-900">{areaForType.toFixed(0)} ha</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Project Card - Show first project if available */}
      {recentProjects.length > 0 && (
        <FeatureProjectCard project={recentProjects[0]} />
      )}
    </div>
  );
}