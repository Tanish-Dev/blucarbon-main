import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Chip from '../components/Chip';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  BarChart3, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive"
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsAPI.delete(projectId);
        toast({
          title: "Success",
          description: "Project deleted successfully!"
        });
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project.",
          variant: "destructive"
        });
      }
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600">Project not found</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const hasImages = project.images && project.images.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#0A0F1C] leading-tight">
            {project.title}
          </h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          {hasImages && (
            <div className="bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden">
              {/* Main Image */}
              <div className="aspect-video bg-gradient-to-br from-emerald-50 to-sky-50">
                <img
                  src={project.images[selectedImageIndex]}
                  alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Thumbnails */}
              {project.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-[#0A6BFF] ring-2 ring-[#0A6BFF]/20'
                          : 'border-transparent hover:border-[#E5EAF0]'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#0A0F1C] mb-4">Description</h2>
            <p className="text-[#475569] leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#0A0F1C] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0A6BFF]" />
              Location
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#475569]">
                <span className="font-medium">Latitude:</span>
                <span>{project.location?.lat?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <span className="font-medium">Longitude:</span>
                <span>{project.location?.lng?.toFixed(6) || 'N/A'}</span>
              </div>
              {project.location?.polygon_vertices && project.location.polygon_vertices.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-[#475569]">Polygon Vertices:</span>
                  <div className="mt-2 text-sm text-[#65728A]">
                    {project.location.polygon_vertices.length} vertices defined
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Status & Tags */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#65728A] mb-2 block">Status</label>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm text-[#65728A] mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm">{project.methodology}</Chip>
                  <Chip size="sm">{project.ecosystem_type}</Chip>
                  <Chip size="sm">{project.vintage}</Chip>
                </div>
              </div>

              {hasImages && (
                <div>
                  <label className="text-sm text-[#65728A] mb-2 block">Photos</label>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-[#0A0F1C] font-medium">
                      {project.images.length} {project.images.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0A6BFF]" />
              Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F7F8FA] rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0A0F1C]">
                  {project.area_hectares}
                </div>
                <div className="text-xs text-[#65728A] mt-1">Hectares</div>
              </div>
              <div className="bg-[#F7F8FA] rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0A0F1C]">
                  {project.metrics?.credits_issued || 0}
                </div>
                <div className="text-xs text-[#65728A] mt-1">Credits Issued</div>
              </div>
              <div className="bg-[#F7F8FA] rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0A0F1C]">
                  {project.metrics?.credits_retired || 0}
                </div>
                <div className="text-xs text-[#65728A] mt-1">Credits Retired</div>
              </div>
              <div className="bg-[#F7F8FA] rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0A0F1C]">
                  {project.metrics?.hectares_monitored || 0}
                </div>
                <div className="text-xs text-[#65728A] mt-1">Monitored</div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0A6BFF]" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[#65728A]">Created:</span>
                <div className="text-[#0A0F1C] font-medium mt-1">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <span className="text-[#65728A]">Last Updated:</span>
                <div className="text-[#0A0F1C] font-medium mt-1">
                  {new Date(project.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4">Actions</h2>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/dmrv-studio')}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Run dMRV Analysis
                </span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/credits')}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Credits
                </span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
