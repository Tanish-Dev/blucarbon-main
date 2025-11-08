import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { projectsAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';
import { 
  Layers, 
  Map, 
  BarChart3, 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Hash, 
  Send,
  Satellite,
  Plane,
  Droplets,
  Cloud,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  ChevronLeft,
  Filter,
  Search,
  TreeDeciduous,
  Waves,
  Play,
  RefreshCw
} from 'lucide-react';
import MetricTile from '../components/MetricTile';
import Chip from '../components/Chip';
import SatelliteComparisonMap from '../components/SatelliteComparisonMap';

export default function DMRVStudio() {
  const [view, setView] = useState('queue'); // 'queue' or 'validation'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Show all projects by default
  
  const [layers, setLayers] = useState({
    baseline: { visible: true, source: 'Sentinel-2', date: '2023-01-15' },
    monitoring: { visible: true, source: 'Sentinel-2', date: '2024-01-15' },
    delta: { visible: true, calculated: true },
    ndvi: { visible: false, name: 'NDVI' },
    rgb: { visible: false, name: 'True Color RGB' },
    uav: { visible: false, source: 'UAV Orthomosaic', date: '2024-02-01' },
    waterMask: { visible: false },
    cloudMask: { visible: true }
  });

  const [showPreview, setShowPreview] = useState(false);
  const [analysis, setAnalysis] = useState({
    biomass: null,
    co2: null,
    areaChange: null,
    confidence: null,
    ndvi: null,
    carbonStock: null
  });
  const [validationNotes, setValidationNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Load projects for validation queue
  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : {};
      console.log('Loading projects with filters:', filters);
      const data = await projectsAPI.getAll(filters);
      console.log('Loaded projects:', data);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setView('validation');
    setValidationNotes('');
    // Run initial analysis
    runAnalysis(project);
  };

  const runAnalysis = async (project) => {
    setAnalyzing(true);
    
    // Simulate analysis with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate analysis calculations
    const baseArea = project.area_hectares || 100;
    const areaChange = Math.random() * 15 + 5; // 5-20 ha increase
    const biomassIncrease = Math.random() * 10 + 5; // 5-15% increase
    const co2Absorbed = areaChange * 3.67 * (biomassIncrease / 100) * baseArea; // Simplified calculation
    const ndviChange = (Math.random() * 0.3 + 0.1).toFixed(3); // 0.1-0.4 NDVI increase
    const carbonStock = (baseArea * (Math.random() * 50 + 100)).toFixed(2); // 100-150 tC/ha
    
    setAnalysis({
      biomass: parseFloat(biomassIncrease.toFixed(2)),
      co2: parseFloat(co2Absorbed.toFixed(2)),
      areaChange: parseFloat(areaChange.toFixed(2)),
      confidence: parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)), // 0.7-0.9
      ndvi: parseFloat(ndviChange),
      carbonStock: parseFloat(carbonStock)
    });
    
    setAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: "Satellite imagery analysis finished successfully"
    });
  };

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({
      ...prev,
      [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible }
    }));
  };

  const handleValidation = async (approve) => {
    if (!selectedProject) return;
    
    try {
      const newStatus = approve ? 'monitoring' : 'rejected';
      await projectsAPI.update(selectedProject.id, {
        ...selectedProject,
        status: newStatus
      });
      
      toast({
        title: approve ? "Project Approved" : "Project Rejected",
        description: approve 
          ? "The project has been approved and moved to monitoring phase"
          : "The project has been rejected with your notes",
      });
      
      // Return to queue
      setView('queue');
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive"
      });
    }
  };

  const generateMRVHash = () => {
    if (!selectedProject || !analysis.co2) return null;
    
    const dataString = JSON.stringify({
      projectId: selectedProject.id,
      timestamp: new Date().toISOString(),
      biomass: analysis.biomass,
      co2: analysis.co2,
      areaChange: analysis.areaChange,
      confidence: analysis.confidence
    });
    
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)}`;
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    return project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.ecosystem_type?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const kpiData = {
    extentDelta: { value: analysis.areaChange || 0, unit: "ha", label: "Extent Δ", trend: "up" },
    biomassProxy: { value: analysis.biomass || 0, unit: "%", label: "Biomass Increase", trend: "up" },
    co2Absorbed: { value: analysis.co2 || 0, unit: "tCO2e", label: "CO₂ Absorbed", trend: "up" },
    ndviChange: { value: analysis.ndvi || 0, unit: "", label: "NDVI Change", trend: "up" },
    carbonStock: { value: analysis.carbonStock || 0, unit: "tC", label: "Carbon Stock" },
    confidence: { value: analysis.confidence || 0, unit: "", label: "Confidence" },
    uncertainty: { value: "U2", unit: "", label: "Uncertainty Class" }
  };

  // Queue View
  if (view === 'queue') {
    return (
      <div className="h-screen bg-[#F7F8FA] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#E5EAF0] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0A0F1C] leading-tight tracking-tight">
                dMRV Studio - Validation Queue
              </h1>
              <p className="text-[#475569] mt-1">
                Review and validate carbon credit projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Chip status={statusFilter}>
                {filteredProjects.length} Projects
              </Chip>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b border-[#E5EAF0] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65728A]" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#65728A]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#E5EAF0] rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="in_review">In Review</option>
                <option value="draft">Draft</option>
                <option value="monitoring">Monitoring</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Queue */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#0A6BFF] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#65728A]">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-12 h-12 text-[#65728A] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0A0F1C] mb-2">No projects found</h3>
                <p className="text-[#65728A]">
                  {projects.length === 0 
                    ? "No projects in database. Create a project in Field Capture."
                    : `${projects.length} projects loaded but filtered out. Try "All Status" filter.`}
                </p>
                <p className="text-xs text-[#65728A] mt-2">
                  Filter: {statusFilter || 'All'} | Search: {searchQuery || 'None'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 max-w-5xl mx-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-[#E5EAF0] rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => selectProject(project)}
                >
                  <div className="flex items-start gap-6">
                    {/* Project Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#10B981]/20 to-[#0A6BFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      {project.ecosystem_type?.toLowerCase().includes('mangrove') ? (
                        <TreeDeciduous className="w-8 h-8 text-[#10B981]" />
                      ) : (
                        <Waves className="w-8 h-8 text-[#0284C7]" />
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-[#0A0F1C] mb-1">
                            {project.title || 'Untitled Project'}
                          </h3>
                          <p className="text-sm text-[#65728A]">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <Button className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white">
                          Review <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#65728A]" />
                          <div>
                            <p className="text-xs text-[#65728A]">Area</p>
                            <p className="text-sm font-medium text-[#0A0F1C]">
                              {project.area_hectares || 0} ha
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TreeDeciduous className="w-4 h-4 text-[#65728A]" />
                          <div>
                            <p className="text-xs text-[#65728A]">Ecosystem</p>
                            <p className="text-sm font-medium text-[#0A0F1C]">
                              {project.ecosystem_type || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#65728A]" />
                          <div>
                            <p className="text-xs text-[#65728A]">Methodology</p>
                            <p className="text-sm font-medium text-[#0A0F1C]">
                              {project.methodology || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#65728A]" />
                          <div>
                            <p className="text-xs text-[#65728A]">Vintage</p>
                            <p className="text-sm font-medium text-[#0A0F1C]">
                              {project.vintage || new Date().getFullYear()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Chip status={project.status || 'draft'} size="sm">
                          {project.status || 'draft'}
                        </Chip>
                        <Chip size="sm">
                          {new Date(project.created_at).toLocaleDateString()}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Validation View
  return (
    <div className="h-screen bg-[#F7F8FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5EAF0] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setView('queue')}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#0A0F1C] leading-tight tracking-tight">
                {selectedProject?.title || 'Project Validation'}
              </h1>
              <p className="text-[#475569] mt-1">
                Satellite analysis and validation dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-[#E5EAF0] hover:border-[#D9E2EC]"
              onClick={() => runAnalysis(selectedProject)}
              disabled={analyzing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
            <Button 
              className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white"
              onClick={() => setShowPreview(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Three-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Layers */}
        <div className="w-80 bg-white border-r border-[#E5EAF0] flex flex-col">
          <div className="p-6 border-b border-[#E5EAF0]">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-[#0A6BFF]" />
              Satellite Layers
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Temporal Layers */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-3">
                TEMPORAL DATA
              </h3>
              <div className="space-y-3">
                {/* Baseline */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.baseline.visible}
                      onCheckedChange={() => toggleLayer('baseline')}
                    />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">Baseline</p>
                      <p className="text-xs text-[#65728A]">
                        {layers.baseline.source} • {layers.baseline.date}
                      </p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-[#10B981] rounded-sm"></div>
                </div>

                {/* Monitoring */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.monitoring.visible}
                      onCheckedChange={() => toggleLayer('monitoring')}
                    />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">Monitoring</p>
                      <p className="text-xs text-[#65728A]">
                        {layers.monitoring.source} • {layers.monitoring.date}
                      </p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-[#0A6BFF] rounded-sm"></div>
                </div>

                {/* Delta */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.delta.visible}
                      onCheckedChange={() => toggleLayer('delta')}
                    />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">Change Detection</p>
                      <p className="text-xs text-[#65728A]">Calculated change</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-r from-[#EF4444] to-[#10B981] rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Analysis Layers */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-3">
                ANALYSIS LAYERS
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.ndvi.visible}
                      onCheckedChange={() => toggleLayer('ndvi')}
                    />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">NDVI</p>
                      <p className="text-xs text-[#65728A]">Vegetation index</p>
                    </div>
                  </div>
                  <Activity className="w-4 h-4 text-[#10B981]" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.rgb.visible}
                      onCheckedChange={() => toggleLayer('rgb')}
                    />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">True Color</p>
                      <p className="text-xs text-[#65728A]">RGB composite</p>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-[#0A6BFF]" />
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-3">
                DATA SOURCES
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Satellite className="w-4 h-4 text-[#475569]" />
                    <span className="text-sm font-medium text-[#0A0F1C]">Sentinel-1</span>
                  </div>
                  <Chip size="sm">SAR</Chip>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Satellite className="w-4 h-4 text-[#475569]" />
                    <span className="text-sm font-medium text-[#0A0F1C]">Sentinel-2</span>
                  </div>
                  <Chip size="sm">Optical</Chip>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.uav.visible}
                      onCheckedChange={() => toggleLayer('uav')}
                    />
                    <Plane className="w-4 h-4 text-[#475569]" />
                    <div>
                      <p className="text-sm font-medium text-[#0A0F1C]">UAV Data</p>
                      <p className="text-xs text-[#65728A]">{layers.uav.date}</p>
                    </div>
                  </div>
                  <Chip size="sm">High-res</Chip>
                </div>
              </div>
            </div>

            {/* Masks */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-3">
                MASKS & QA
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.waterMask.visible}
                      onCheckedChange={() => toggleLayer('waterMask')}
                    />
                    <Droplets className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-sm font-medium text-[#0A0F1C]">Water Mask</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={layers.cloudMask.visible}
                      onCheckedChange={() => toggleLayer('cloudMask')}
                    />
                    <Cloud className="w-4 h-4 text-[#65728A]" />
                    <span className="text-sm font-medium text-[#0A0F1C]">Cloud Mask</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white border border-[#E5EAF0] rounded-2xl overflow-hidden">
            <SatelliteComparisonMap 
              coordinates={selectedProject?.location?.coordinates}
              polygon={selectedProject?.location?.polygon}
              projectId={selectedProject?._id}
              activeLayers={layers}
              className="h-full"
            />
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="w-96 bg-white border-l border-[#E5EAF0] flex flex-col">
          <div className="p-6 border-b border-[#E5EAF0]">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#0A6BFF]" />
              Analysis Results
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Analysis Status */}
            {analyzing && (
              <div className="bg-[#E0F2FE] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 text-[#0A6BFF] animate-spin" />
                  <span className="font-medium text-[#0A0F1C]">Analyzing...</span>
                </div>
                <p className="text-sm text-[#475569]">Processing satellite imagery and calculating metrics</p>
              </div>
            )}

            {/* KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-4">
                KEY METRICS
              </h3>
              <div className="space-y-3">
                <MetricTile metric={kpiData.extentDelta} compact />
                <MetricTile metric={kpiData.biomassProxy} compact />
                <MetricTile metric={kpiData.co2Absorbed} compact />
                <MetricTile metric={kpiData.ndviChange} compact />
                <MetricTile metric={kpiData.carbonStock} compact />
                <MetricTile metric={kpiData.confidence} compact />
                <MetricTile metric={kpiData.uncertainty} compact />
              </div>
            </div>

            {/* Time Series */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-4">
                BIOMASS TREND
              </h3>
              <div className="bg-[#F7F8FA] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#0A0F1C]">12-month Change</span>
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="h-16 flex items-end justify-between gap-1">
                  {[0.6, 0.7, 0.65, 0.75, 0.8, 0.85, 0.9, 0.92, 0.95, 0.97, 0.98, 1.0].map((height, i) => (
                    <div
                      key={i}
                      className="bg-[#10B981] rounded-sm flex-1"
                      style={{ height: `${height * 100}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-[#65728A] mt-2">
                  <span>Jan '23</span>
                  <span>Jan '24</span>
                </div>
              </div>
            </div>

            {/* Quality Indicators */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-4">
                QUALITY ASSURANCE
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#ECFDF5] rounded-lg">
                  <span className="text-sm text-[#0A0F1C]">Cloud Coverage</span>
                  <Chip status="Monitoring" size="sm">2.3%</Chip>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#ECFDF5] rounded-lg">
                  <span className="text-sm text-[#0A0F1C]">Data Quality</span>
                  <Chip status="Monitoring" size="sm">High</Chip>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FFF7ED] rounded-lg">
                  <span className="text-sm text-[#0A0F1C]">Uncertainty</span>
                  <Chip status="In Review" size="sm">U2</Chip>
                </div>
              </div>
            </div>

            {/* Validation Notes */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-3">
                VALIDATION NOTES
              </h3>
              <Textarea
                placeholder="Add validation notes and observations..."
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E5EAF0] space-y-3">
              <Button 
                className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                onClick={() => handleValidation(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#E5EAF0] hover:border-[#D9E2EC] text-[#DC2626] hover:bg-[#FEF2F2]"
                onClick={() => handleValidation(false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#E5EAF0] hover:border-[#D9E2EC]"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MRV Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[#E5EAF0]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0A0F1C]">
                  MRV Report Preview
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Report Header */}
                <div className="text-center pb-6 border-b border-[#E5EAF0]">
                  <h1 className="text-3xl font-bold text-[#0A0F1C] mb-2">
                    dMRV Report
                  </h1>
                  <p className="text-[#475569] mb-4">
                    {selectedProject?.title} — {selectedProject?.ecosystem_type}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Chip status="VM0033">{selectedProject?.methodology || 'VM0033'}</Chip>
                    <Chip status="Vintage 2024">{selectedProject?.vintage || '2024'}</Chip>
                    <Chip status="Monitoring">Verified</Chip>
                  </div>
                </div>

                {/* Key Results */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#ECFDF5] rounded-xl p-4 text-center">
                    <p className="text-sm text-[#65728A] mb-1">CO₂ Absorbed</p>
                    <p className="text-3xl font-bold text-[#10B981]">{analysis.co2?.toFixed(1) || 0}</p>
                    <p className="text-sm text-[#65728A]">tCO2e</p>
                  </div>
                  <div className="bg-[#EFF6FF] rounded-xl p-4 text-center">
                    <p className="text-sm text-[#65728A] mb-1">Area Change</p>
                    <p className="text-3xl font-bold text-[#0A6BFF]">+{analysis.areaChange?.toFixed(1) || 0}</p>
                    <p className="text-sm text-[#65728A]">hectares</p>
                  </div>
                  <div className="bg-[#FFF7ED] rounded-xl p-4 text-center">
                    <p className="text-sm text-[#65728A] mb-1">Confidence</p>
                    <p className="text-3xl font-bold text-[#F59E0B]">{(analysis.confidence * 100)?.toFixed(0) || 0}%</p>
                    <p className="text-sm text-[#65728A]">High</p>
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="bg-[#F7F8FA] rounded-xl p-6">
                  <h3 className="font-semibold text-[#0A0F1C] mb-3 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-[#0A6BFF]" />
                    Analysis Summary
                  </h3>
                  <div className="space-y-2 text-sm text-[#475569]">
                    <p>• Baseline period: {layers.baseline.date}</p>
                    <p>• Monitoring period: {layers.monitoring.date}</p>
                    <p>• Biomass increase: {analysis.biomass?.toFixed(1)}%</p>
                    <p>• NDVI change: +{analysis.ndvi?.toFixed(3)}</p>
                    <p>• Carbon stock: {analysis.carbonStock?.toFixed(1)} tC</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Data Sources</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Sentinel-2 Optical (2023-2024)</li>
                      <li>• Sentinel-1 SAR (2023-2024)</li>
                      <li>• NDVI time series analysis</li>
                      <li>• Cloud masking applied</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Methods</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Change detection algorithms</li>
                      <li>• Biomass proxy modeling</li>
                      <li>• Uncertainty quantification</li>
                      <li>• Statistical validation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">QA/QC</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Cloud masking verified</li>
                      <li>• Geometric correction applied</li>
                      <li>• Statistical significance tested</li>
                      <li>• Cross-validation performed</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Uncertainty</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Classification: U2</li>
                      <li>• Confidence level: {(analysis.confidence * 100)?.toFixed(0)}%</li>
                      <li>• Error bounds: ±{(analysis.areaChange * 0.15)?.toFixed(1)} ha</li>
                      <li>• Monte Carlo validated</li>
                    </ul>
                  </div>
                </div>

                {/* MRV Hash */}
                <div className="bg-[#F7F8FA] rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-[#65728A]" />
                    <span className="text-sm font-medium text-[#65728A]">MRV Hash</span>
                  </div>
                  <code className="text-xs text-[#0A0F1C] bg-white px-3 py-1 rounded font-mono break-all">
                    {generateMRVHash()}
                  </code>
                  <p className="text-xs text-[#65728A] mt-2">
                    Generated: {new Date().toLocaleString()}
                  </p>
                </div>

                {/* Validation Notes */}
                {validationNotes && (
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Validator Notes</h3>
                    <p className="text-sm text-[#475569] whitespace-pre-wrap">{validationNotes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-[#E5EAF0] flex justify-between">
              <Button variant="outline" className="border-[#E5EAF0] hover:border-[#D9E2EC]">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <div className="flex gap-3">
                <Button 
                  className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Publish & Hash
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
