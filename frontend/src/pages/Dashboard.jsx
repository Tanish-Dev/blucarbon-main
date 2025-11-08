import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeatureProjectCard from '../components/FeatureProjectCard';
import ProjectMap from '../components/ProjectMap';
import { mockProject, mockActivity } from '../mock';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Upload, BarChart3, FileText, ShoppingCart, Clock, Loader2, FolderKanban, Award, TrendingUp, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, creditsAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_projects: 0,
    total_credits: 0,
    issued_credits: 0,
    pending_credits: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects and credits data
        const [projectsData, creditsStats] = await Promise.all([
          projectsAPI.getAll(),
          creditsAPI.getStats().catch(() => ({ total_credits: 0, issued_credits: 0, pending_credits: 0 }))
        ]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Stats Overview with Icons and Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              Total Credits
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

      {/* Quick Actions with Enhanced Design */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
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

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Enhanced Map Component */}
        <div className="lg:col-span-1">
          <ProjectMap />
        </div>

        {/* Enhanced Recent Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
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

      {/* Feature Project Card - Show first project if available */}
      {recentProjects.length > 0 && (
        <FeatureProjectCard project={recentProjects[0]} />
      )}
    </div>
  );
}