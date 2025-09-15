import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeatureProjectCard from '../components/FeatureProjectCard';
import ProjectMap from '../components/ProjectMap';
import { mockProject, mockActivity } from '../mock';
import { Button } from '../components/ui/button';
import { Upload, BarChart3, FileText, ShoppingCart, Clock, Loader2 } from 'lucide-react';
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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight ">
         Hello<br />
        </h1>
        <p className="text-5xl text-slate-900 font-bold max-w-2xl tracking-tighter">
         {user?.full_name || user?.username || 'User'}
        </p>
        <p className="text-lg text-slate-600 mt-4">
          Welcome to your carbon credit management dashboard
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.total_projects}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Total Projects
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.total_credits}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Total Credits
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.issued_credits}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Issued Credits
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.pending_credits}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Pending Credits
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-6 flex-col gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/projects')}
          >
            <Upload className="w-6 h-6 text-green-600" />
            <div className="text-center">
              <div className="font-medium text-slate-900">Register Project</div>
              <div className="text-sm text-slate-600 mt-1">Start new carbon project</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-6 flex-col gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/field-capture')}
          >
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <div className="text-center">
              <div className="font-medium text-slate-900">Upload Field Data</div>
              <div className="text-sm text-slate-600 mt-1">Sync measurement data</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-6 flex-col gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/dmrv-studio')}
          >
            <FileText className="w-6 h-6 text-sky-600" />
            <div className="text-center">
              <div className="font-medium text-slate-900">Run dMRV</div>
              <div className="text-sm text-slate-600 mt-1">Generate MRV report</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-6 flex-col gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/marketplace')}
          >
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <div className="text-center">
              <div className="font-medium text-slate-900">Marketplace</div>
              <div className="text-sm text-slate-600 mt-1">Browse carbon credits</div>
            </div>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Real Map Component */}
        <ProjectMap />

        {/* Recent Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Recent Projects
          </h3>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-[#00e07a] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium leading-tight">
                      {project.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {project.ecosystem_type} • {project.area_hectares} hectares • {project.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No projects yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first project to get started</p>
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