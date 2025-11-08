import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import MetricTile from '../components/MetricTile';
import Chip from '../components/Chip';
import { Plus, Filter, Grid3X3, List, ExternalLink, Loader2 } from 'lucide-react';
import { projectsAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = {
    ecosystem: ['Mangrove', 'Seagrass', 'Salt Marsh'],
    status: ['draft', 'in_review', 'monitoring', 'issued'],
    vintage: ['2024', '2023', '2022'],
    methodology: ['VM0033', 'VM0007', 'CDM']
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(projectId);
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
        toast({ title: 'Project deleted successfully', status: 'success' });
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast({ title: 'Failed to delete project', status: 'error' });
      }
    }
  };

  const addFilter = (category, value) => {
    const newFilter = { category, value, id: `${category}-${value}` };
    if (!filters.find(f => f.id === newFilter.id)) {
      setFilters([...filters, newFilter]);
    }
  };

  const removeFilter = (filterId) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'monitoring':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'issued':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredProjects = projects.filter(project => {
    return filters.every(filter => {
      switch (filter.category) {
        case 'ecosystem':
          return project.ecosystem_type === filter.value;
        case 'status':
          return project.status === filter.value;
        case 'vintage':
          return project.vintage === filter.value;
        case 'methodology':
          return project.methodology === filter.value;
        default:
          return true;
      }
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A0F1C] leading-tight tracking-tight mb-2">
            Projects
          </h1>
          <p className="text-lg text-[#475569]">
            Manage and monitor your blue carbon projects
          </p>
        </div>
        
        <Button 
          className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3 rounded-full font-medium"
          onClick={handleCreateProject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#475569]" />
              <span className="text-sm font-medium text-[#475569]">Filters:</span>
            </div>
            
            {Object.entries(filterOptions).map(([category, options]) => (
              <div key={category} className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 border-[#E5EAF0] hover:border-[#D9E2EC] capitalize"
                >
                  {category}
                </Button>
                <div className="absolute top-10 left-0 hidden group-hover:block z-10">
                  <div className="bg-white border border-[#E5EAF0] rounded-lg shadow-lg py-2 min-w-[120px]">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => addFilter(category, option)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[#F7F8FA] transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#E5EAF0]">
            {filters.map((filter) => (
              <Chip
                key={filter.id}
                variant="outline"
                removable
                onRemove={() => removeFilter(filter.id)}
              >
                {filter.value}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden hover:border-[#D9E2EC] transition-all hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_8px_24px_rgba(16,24,40,0.06)]">
            {/* Project Image */}
            {project.images && project.images.length > 0 && (
              <div className="aspect-video w-full bg-gradient-to-br from-emerald-50 to-sky-50 overflow-hidden">
                <img 
                  src={project.images[0]} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(to bottom right, #ecfdf5, #f0f9ff)';
                  }}
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex gap-4 h-full">
                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A0F1C] mb-2 leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-[#475569] text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <Chip status={project.methodology} size="sm">{project.methodology}</Chip>
                    <Chip status={project.status} size="sm" className={getStatusColor(project.status)}>
                      {project.status}
                    </Chip>
                    <Chip size="sm">{project.vintage}</Chip>
                    {project.images && project.images.length > 0 && (
                      <Chip size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
                        {project.images.length} {project.images.length === 1 ? 'photo' : 'photos'}
                      </Chip>
                    )}
                  </div>

                  {/* Mini Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-[#F7F8FA] rounded-lg">
                      <div className="text-sm font-semibold text-[#0A0F1C]">
                        {project.area_hectares} ha
                      </div>
                      <div className="text-xs text-[#65728A]">Area</div>
                    </div>
                    <div className="text-center p-2 bg-[#F7F8FA] rounded-lg">
                      <div className="text-sm font-semibold text-[#0A0F1C]">
                        {project.metrics?.credits_issued || 0} tCO2e
                      </div>
                      <div className="text-xs text-[#65728A]">Issued</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-between border-[#E5EAF0] hover:border-[#D9E2EC]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      View Project
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white border border-[#E5EAF0] rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#F7F8FA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-[#65728A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-2">
              No projects found
            </h3>
            <p className="text-[#475569] mb-6">
              {filters.length > 0 
                ? "No projects match your current filters. Try adjusting your search criteria."
                : "Get started by registering your first blue carbon project."
              }
            </p>
            {filters.length === 0 && (
              <Button 
                className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-8 py-3 rounded-full font-medium"
                onClick={handleCreateProject}
              >
                Register Project
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}