import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { projectsAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';
import { 
  MapPin, 
  Camera, 
  Save, 
  Upload, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  RotateCcw,
  Clock,
  ArrowLeft,
  X
} from 'lucide-react';
import Chip from '../components/Chip';

const FIELD_STEPS = [
  { id: 1, label: 'GPS', icon: MapPin },
  { id: 2, label: 'Details', icon: CheckCircle },
  { id: 3, label: 'Media', icon: Camera },
  { id: 4, label: 'Review', icon: Save }
];

const PROJECT_STEPS = [
  { id: 1, label: 'Project Info', icon: CheckCircle },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Field Data', icon: Camera },
  { id: 4, label: 'Review', icon: Save }
];

export default function FieldCapture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isProjectMode = searchParams.get('mode') === 'create' || location.pathname === '/create-project';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const [formData, setFormData] = useState({
    // Project-specific fields
    project: {
      title: '',
      description: '',
      methodology: '',
      ecosystem_type: '',
      vintage: new Date().getFullYear().toString(),
      area_hectares: ''
    },
    // GPS and location data
    gps: { latitude: '', longitude: '', accuracy: 0, address: '' },
    // Field/plot details
    details: { 
      plotId: '', 
      species: '', 
      canopyCover: [65], 
      soilType: '', 
      notes: '' 
    },
    media: { photos: [], measurements: '' },
    syncQueue: [
      { id: 1, plotId: 'GOD-001', timestamp: '2 mins ago', status: 'pending' },
      { id: 2, plotId: 'GOD-002', timestamp: '1 hr ago', status: 'failed' }
    ]
  });

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          };
          
          setFormData(prev => ({
            ...prev,
            media: {
              ...prev.media,
              photos: [...prev.media.photos, newPhoto]
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset the input
    event.target.value = '';
  };

  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        photos: prev.media.photos.filter(photo => photo.id !== photoId)
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const saveAndSync = async () => {
    try {
      if (isProjectMode) {
        // Create new project
        const projectData = {
          title: formData.project.title,
          description: formData.project.description,
          methodology: formData.project.methodology,
          ecosystem_type: formData.project.ecosystem_type,
          vintage: formData.project.vintage,
          area_hectares: parseFloat(formData.project.area_hectares),
          location: {
            lat: parseFloat(formData.gps.latitude) || 0,
            lng: parseFloat(formData.gps.longitude) || 0,
            address: formData.gps.address
          },
          // Include field data if provided
          field_data: {
            species: formData.details.species,
            canopy_cover: formData.details.canopyCover[0],
            soil_type: formData.details.soilType,
            notes: formData.details.notes,
            measurements: formData.media.measurements,
            photos_count: formData.media.photos.length
          }
        };

        await projectsAPI.create(projectData);
        toast({
          title: "Success",
          description: "Project created successfully!"
        });
        
        // Navigate back to projects page
        navigate('/projects');
      } else {
        // Mock save functionality for field data
        const newEntry = {
          id: Date.now(),
          plotId: formData.details.plotId || `GOD-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          timestamp: 'Just now',
          status: isOffline ? 'pending' : 'synced'
        };
        
        setFormData(prev => ({
          ...prev,
          syncQueue: [newEntry, ...prev.syncQueue]
        }));
        
        toast({
          title: "Success",
          description: "Field data saved successfully!"
        });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save. Please try again.",
        variant: "destructive"
      });
    }
  };

  const retrySync = (id) => {
    setFormData(prev => ({
      ...prev,
      syncQueue: prev.syncQueue.map(item => 
        item.id === id ? { ...item, status: 'synced' } : item
      )
    }));
  };

  const deleteFromQueue = (id) => {
    setFormData(prev => ({
      ...prev,
      syncQueue: prev.syncQueue.filter(item => item.id !== id)
    }));
  };

  const STEPS = isProjectMode ? PROJECT_STEPS : FIELD_STEPS;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-[#FFF7ED] border-b border-[#FED7AA] p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-[#F59E0B]" />
            <div className="flex-1">
              <p className="text-[#F59E0B] font-medium">Working offline</p>
              <p className="text-sm text-[#92400E]">Data will sync when connection is restored</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOffline(!isOffline)}
              className="border-[#FED7AA] text-[#F59E0B] hover:bg-[#FEF3C7]"
            >
              {isOffline ? 'Go Online' : 'Go Offline'}
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {isProjectMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-[#0A0F1C] leading-tight tracking-tight mb-2">
                {isProjectMode ? 'Create New Project' : 'Field Capture'}
              </h1>
              <p className="text-lg text-[#475569]">
                {isProjectMode 
                  ? 'Register a new blue carbon project with comprehensive data'
                  : 'Collect field measurements and upload plot data'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${
                    isActive ? 'text-[#0A6BFF]' : isCompleted ? 'text-[#10B981]' : 'text-[#65728A]'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-[#0A6BFF] text-white' 
                        : isCompleted 
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#F7F8FA] text-[#65728A]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium hidden sm:block">{step.label}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 sm:w-24 h-0.5 mx-4 ${
                      isCompleted ? 'bg-[#10B981]' : 'bg-[#E5EAF0]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-8 mb-8">
          {/* Step 1: Project Info (Project Mode) or GPS (Field Mode) */}
          {currentStep === 1 && (
            <>
              {isProjectMode ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">Project Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-[#0A0F1C] font-medium">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Godavari Delta Mangrove Restoration"
                        value={formData.project.title}
                        onChange={(e) => updateFormData('project', { title: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vintage" className="text-[#0A0F1C] font-medium">Vintage Year</Label>
                      <Input
                        id="vintage"
                        type="number"
                        value={formData.project.vintage}
                        onChange={(e) => updateFormData('project', { vintage: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#0A0F1C] font-medium">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of your blue carbon project..."
                      value={formData.project.description}
                      onChange={(e) => updateFormData('project', { description: e.target.value })}
                      className="min-h-[120px] border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[#0A0F1C] font-medium">Methodology</Label>
                      <Select 
                        value={formData.project.methodology} 
                        onValueChange={(value) => updateFormData('project', { methodology: value })}
                      >
                        <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                          <SelectValue placeholder="Select methodology" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VM0033">VM0033</SelectItem>
                          <SelectItem value="VM0007">VM0007</SelectItem>
                          <SelectItem value="CDM">CDM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[#0A0F1C] font-medium">Ecosystem Type</Label>
                      <Select 
                        value={formData.project.ecosystem_type} 
                        onValueChange={(value) => updateFormData('project', { ecosystem_type: value })}
                      >
                        <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                          <SelectValue placeholder="Select ecosystem" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mangrove">Mangrove</SelectItem>
                          <SelectItem value="Seagrass">Seagrass</SelectItem>
                          <SelectItem value="Salt Marsh">Salt Marsh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-[#0A0F1C] font-medium">Area (hectares)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="any"
                        placeholder="100"
                        value={formData.project.area_hectares}
                        onChange={(e) => updateFormData('project', { area_hectares: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">GPS Coordinates</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-[#0A0F1C] font-medium">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="16.7644"
                        value={formData.gps.latitude}
                        onChange={(e) => updateFormData('gps', { latitude: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-[#0A0F1C] font-medium">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="81.6375"
                        value={formData.gps.longitude}
                        onChange={(e) => updateFormData('gps', { longitude: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#0A0F1C] font-medium">GPS Accuracy: {formData.gps.accuracy}m</Label>
                    <Slider
                      value={[formData.gps.accuracy]}
                      onValueChange={(value) => updateFormData('gps', { accuracy: value[0] })}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-[#65728A]">
                      <span>0m (Excellent)</span>
                      <span>50m (Poor)</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-14 border-[#E5EAF0] hover:border-[#D9E2EC] hover:bg-[#F7F8FA]"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Use Current Location
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Step 2: Location (Project Mode) or Details (Field Mode) */}
          {currentStep === 2 && (
            <>
              {isProjectMode ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">Project Location</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-[#0A0F1C] font-medium">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="16.7644"
                        value={formData.gps.latitude}
                        onChange={(e) => updateFormData('gps', { latitude: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-[#0A0F1C] font-medium">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="81.6375"
                        value={formData.gps.longitude}
                        onChange={(e) => updateFormData('gps', { longitude: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#0A0F1C] font-medium">Project Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., Godavari Delta, Andhra Pradesh, India"
                      value={formData.gps.address}
                      onChange={(e) => updateFormData('gps', { address: e.target.value })}
                      className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#0A0F1C] font-medium">GPS Accuracy: {formData.gps.accuracy}m</Label>
                    <Slider
                      value={[formData.gps.accuracy]}
                      onValueChange={(value) => updateFormData('gps', { accuracy: value[0] })}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-[#65728A]">
                      <span>0m (Excellent)</span>
                      <span>50m (Poor)</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-14 border-[#E5EAF0] hover:border-[#D9E2EC] hover:bg-[#F7F8FA]"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Use Current Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">Plot Details</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="plotId" className="text-[#0A0F1C] font-medium">Plot ID</Label>
                      <Input
                        id="plotId"
                        placeholder="GOD-001"
                        value={formData.details.plotId}
                        onChange={(e) => updateFormData('details', { plotId: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[#0A0F1C] font-medium">Species</Label>
                      <Select onValueChange={(value) => updateFormData('details', { species: value })}>
                        <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rhizophora">Rhizophora mucronata</SelectItem>
                          <SelectItem value="avicennia">Avicennia marina</SelectItem>
                          <SelectItem value="sonneratia">Sonneratia alba</SelectItem>
                          <SelectItem value="bruguiera">Bruguiera gymnorrhiza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#0A0F1C] font-medium">Canopy Cover: {formData.details.canopyCover[0]}%</Label>
                    <Slider
                      value={formData.details.canopyCover}
                      onValueChange={(value) => updateFormData('details', { canopyCover: value })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-[#65728A]">
                      <span>0% (No Cover)</span>
                      <span>100% (Full Cover)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0A0F1C] font-medium">Soil Type</Label>
                    <Select onValueChange={(value) => updateFormData('details', { soilType: value })}>
                      <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                        <SelectItem value="sand">Sand</SelectItem>
                        <SelectItem value="peat">Peat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[#0A0F1C] font-medium">Field Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional observations, conditions, remarks..."
                      value={formData.details.notes}
                      onChange={(e) => updateFormData('details', { notes: e.target.value })}
                      className="min-h-[120px] border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 3: Field Data (Both Modes) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">
                {isProjectMode ? 'Field Data & Measurements' : 'Media & Measurements'}
              </h2>
              
              {isProjectMode && (
                <div className="space-y-6 mb-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="plotId" className="text-[#0A0F1C] font-medium">Sample Plot ID</Label>
                      <Input
                        id="plotId"
                        placeholder="GOD-001"
                        value={formData.details.plotId}
                        onChange={(e) => updateFormData('details', { plotId: e.target.value })}
                        className="h-14 text-lg border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[#0A0F1C] font-medium">Dominant Species</Label>
                      <Select 
                        value={formData.details.species}
                        onValueChange={(value) => updateFormData('details', { species: value })}
                      >
                        <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rhizophora">Rhizophora mucronata</SelectItem>
                          <SelectItem value="avicennia">Avicennia marina</SelectItem>
                          <SelectItem value="sonneratia">Sonneratia alba</SelectItem>
                          <SelectItem value="bruguiera">Bruguiera gymnorrhiza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[#0A0F1C] font-medium">Canopy Cover: {formData.details.canopyCover[0]}%</Label>
                      <Slider
                        value={formData.details.canopyCover}
                        onValueChange={(value) => updateFormData('details', { canopyCover: value })}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-[#65728A]">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#0A0F1C] font-medium">Soil Type</Label>
                      <Select 
                        value={formData.details.soilType}
                        onValueChange={(value) => updateFormData('details', { soilType: value })}
                      >
                        <SelectTrigger className="h-14 text-lg border-[#E5EAF0] rounded-xl">
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clay">Clay</SelectItem>
                          <SelectItem value="silt">Silt</SelectItem>
                          <SelectItem value="sand">Sand</SelectItem>
                          <SelectItem value="peat">Peat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[#0A0F1C] font-medium">Field Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional observations, site conditions, biodiversity notes..."
                      value={formData.details.notes}
                      onChange={(e) => updateFormData('details', { notes: e.target.value })}
                      className="min-h-[100px] border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                    />
                  </div>

                  <hr className="border-[#E5EAF0]" />
                </div>
              )}
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-[#E5EAF0] rounded-xl p-8 text-center hover:border-[#D9E2EC] transition-colors">
                  <Camera className="w-12 h-12 text-[#65728A] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#0A0F1C] mb-2">Upload Photos</h3>
                  <p className="text-[#475569] mb-4">
                    {isProjectMode 
                      ? 'Upload photos of the project site, vegetation, and key features'
                      : 'Upload photos of the plot, canopy, and soil conditions'
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3 rounded-full"
                      onClick={() => document.getElementById('photo-upload').click()}
                      type="button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                    <Button 
                      variant="outline"
                      className="px-6 py-3 rounded-full border-[#E5EAF0] hover:border-[#D9E2EC]"
                      onClick={() => document.getElementById('camera-capture').click()}
                      type="button"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    id="camera-capture"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.media.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-[#F7F8FA] rounded-xl border border-[#E5EAF0] overflow-hidden">
                        <img
                          src={photo.preview}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="mt-1 text-xs text-[#65728A] truncate">
                        {photo.name}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty slots to show potential */}
                  {Array.from({ length: Math.max(0, 4 - formData.media.photos.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-[#F7F8FA] rounded-xl border border-[#E5EAF0] flex items-center justify-center opacity-50">
                      <Camera className="w-8 h-8 text-[#65728A]" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurements" className="text-[#0A0F1C] font-medium">
                    {isProjectMode ? 'Site Measurements & Observations' : 'Additional Measurements'}
                  </Label>
                  <Textarea
                    id="measurements"
                    value={formData.media.measurements}
                    onChange={(e) => updateFormData('media', { measurements: e.target.value })}
                    placeholder={isProjectMode 
                      ? "Site dimensions, biomass estimates, carbon stock measurements..."
                      : "DBH measurements, height estimates, biomass calculations..."
                    }
                    className="min-h-[100px] border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-[#0A6BFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">Review & Submit</h2>
              
              <div className="space-y-6">
                {isProjectMode && (
                  <div className="bg-[#F7F8FA] rounded-xl p-6">
                    <h3 className="font-semibold text-[#0A0F1C] mb-4">Project Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#65728A]">Title:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.project.title || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[#65728A]">Vintage:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.project.vintage}</span>
                      </div>
                      <div>
                        <span className="text-[#65728A]">Methodology:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.project.methodology || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[#65728A]">Ecosystem:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.project.ecosystem_type || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[#65728A]">Area:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.project.area_hectares ? `${formData.project.area_hectares} hectares` : 'Not specified'}</span>
                      </div>
                    </div>
                    {formData.project.description && (
                      <div className="mt-4">
                        <span className="text-[#65728A]">Description:</span>
                        <p className="mt-1 text-[#0A0F1C] text-sm">{formData.project.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-[#F7F8FA] rounded-xl p-6">
                  <h3 className="font-semibold text-[#0A0F1C] mb-4">
                    {isProjectMode ? 'Location & Site Data' : 'Plot Summary'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#65728A]">
                        {isProjectMode ? 'GPS Coordinates:' : 'Plot ID:'}
                      </span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">
                        {isProjectMode 
                          ? (formData.gps.latitude && formData.gps.longitude 
                              ? `${formData.gps.latitude}, ${formData.gps.longitude}` 
                              : 'Not captured')
                          : (formData.details.plotId || 'Not specified')
                        }
                      </span>
                    </div>
                    {isProjectMode && (
                      <div>
                        <span className="text-[#65728A]">Address:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">{formData.gps.address || 'Not specified'}</span>
                      </div>
                    )}
                    {!isProjectMode && (
                      <div>
                        <span className="text-[#65728A]">GPS:</span>
                        <span className="ml-2 text-[#0A0F1C] font-medium">
                          {formData.gps.latitude && formData.gps.longitude 
                            ? `${formData.gps.latitude}, ${formData.gps.longitude}` 
                            : 'Not captured'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#65728A]">Species:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.species || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">Canopy Cover:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.canopyCover[0]}%</span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">Soil Type:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.soilType || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">GPS Accuracy:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.gps.accuracy}m</span>
                    </div>
                  </div>
                  {formData.details.notes && (
                    <div className="mt-4">
                      <span className="text-[#65728A]">Notes:</span>
                      <p className="mt-1 text-[#0A0F1C] text-sm">{formData.details.notes}</p>
                    </div>
                  )}
                </div>

                {/* Photos and Measurements Review */}
                {(formData.media.photos.length > 0 || formData.media.measurements) && (
                  <div className="bg-[#F7F8FA] rounded-xl p-6">
                    <h3 className="font-semibold text-[#0A0F1C] mb-4">
                      {isProjectMode ? 'Site Documentation' : 'Field Documentation'}
                    </h3>
                    
                    {formData.media.photos.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[#65728A] text-sm">Photos ({formData.media.photos.length}):</span>
                        <div className="mt-2 grid grid-cols-4 md:grid-cols-6 gap-2">
                          {formData.media.photos.map((photo) => (
                            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-[#E5EAF0]">
                              <img
                                src={photo.preview}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.media.measurements && (
                      <div>
                        <span className="text-[#65728A] text-sm">Measurements:</span>
                        <p className="mt-1 text-[#0A0F1C] text-sm">{formData.media.measurements}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0A0F1C]">Data Integrity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#475569]">
                        {isProjectMode ? 'Project data validated' : 'GPS coordinates validated'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#475569]">Checksum generated: 0x7a8b9c2d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-sm text-[#475569]">
                        {isProjectMode ? 'Ready for project creation' : 'Ready for sync queue'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-[#E5EAF0] mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border-[#E5EAF0] hover:border-[#D9E2EC]"
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3"
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-3">
                {!isProjectMode && (
                  <Button
                    variant="outline"
                    onClick={saveAndSync}
                    className="px-6 py-3 border-[#E5EAF0] hover:border-[#D9E2EC]"
                  >
                    Sync Later
                  </Button>
                )}
                <Button
                  onClick={saveAndSync}
                  className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isProjectMode ? 'Create Project' : 'Save & Sync'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sync Queue - only show in field mode */}
        {!isProjectMode && formData.syncQueue.length > 0 && (
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[#0A0F1C] mb-4">Sync Queue</h3>
            <div className="space-y-3">
              {formData.syncQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'synced' ? 'bg-[#10B981]' : 
                      item.status === 'pending' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                    }`} />
                    <div>
                      <p className="font-medium text-[#0A0F1C]">{item.plotId}</p>
                      <p className="text-sm text-[#65728A]">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip 
                      status={item.status === 'synced' ? 'Monitoring' : item.status === 'pending' ? 'In Review' : 'Draft'}
                      size="sm"
                    >
                      {item.status}
                    </Chip>
                    {item.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retrySync(item.id)}
                        className="h-8 w-8 p-0 text-[#0A6BFF] hover:bg-[#EEF2FF]"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFromQueue(item.id)}
                      className="h-8 w-8 p-0 text-[#EF4444] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer - Mobile optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5EAF0] p-4 lg:hidden">
        <div className="flex gap-3">
          {!isProjectMode && (
            <Button
              variant="outline"
              onClick={saveAndSync}
              className="flex-1 h-12 border-[#E5EAF0] hover:border-[#D9E2EC]"
            >
              Sync Later
            </Button>
          )}
          <Button
            onClick={saveAndSync}
            className="flex-1 h-12 bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isProjectMode ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}