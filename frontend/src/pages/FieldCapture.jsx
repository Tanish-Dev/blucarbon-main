import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Clock
} from 'lucide-react';
import Chip from '../components/Chip';

const STEPS = [
  { id: 1, label: 'GPS', icon: MapPin },
  { id: 2, label: 'Details', icon: CheckCircle },
  { id: 3, label: 'Media', icon: Camera },
  { id: 4, label: 'Review', icon: Save }
];

export default function FieldCapture() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const [formData, setFormData] = useState({
    gps: { latitude: '', longitude: '', accuracy: 0 },
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

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const saveAndSync = () => {
    // Mock save functionality
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
          <h1 className="text-4xl font-bold text-[#0A0F1C] leading-tight tracking-tight mb-2">
            Field Capture
          </h1>
          <p className="text-lg text-[#475569]">
            Collect field measurements and upload plot data
          </p>
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
          {/* Step 1: GPS */}
          {currentStep === 1 && (
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

          {/* Step 2: Details */}
          {currentStep === 2 && (
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

          {/* Step 3: Media */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#0A0F1C] mb-6">Media & Measurements</h2>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-[#E5EAF0] rounded-xl p-8 text-center hover:border-[#D9E2EC] transition-colors">
                  <Camera className="w-12 h-12 text-[#65728A] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#0A0F1C] mb-2">Capture Photos</h3>
                  <p className="text-[#475569] mb-4">Take photos of the plot, canopy, and soil conditions</p>
                  <Button className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3 rounded-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-[#F7F8FA] rounded-xl border border-[#E5EAF0] flex items-center justify-center">
                      <Camera className="w-8 h-8 text-[#65728A]" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurements" className="text-[#0A0F1C] font-medium">Additional Measurements</Label>
                  <Textarea
                    id="measurements"
                    placeholder="DBH measurements, height estimates, biomass calculations..."
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
                <div className="bg-[#F7F8FA] rounded-xl p-6">
                  <h3 className="font-semibold text-[#0A0F1C] mb-4">Plot Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#65728A]">Plot ID:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.plotId || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">Species:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.species || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">GPS:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">
                        {formData.gps.latitude && formData.gps.longitude 
                          ? `${formData.gps.latitude}, ${formData.gps.longitude}` 
                          : 'Not captured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#65728A]">Canopy Cover:</span>
                      <span className="ml-2 text-[#0A0F1C] font-medium">{formData.details.canopyCover[0]}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0A0F1C]">Data Integrity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#475569]">GPS coordinates validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#475569]">Checksum generated: 0x7a8b9c2d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-sm text-[#475569]">Ready for sync queue</span>
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
                <Button
                  variant="outline"
                  onClick={saveAndSync}
                  className="px-6 py-3 border-[#E5EAF0] hover:border-[#D9E2EC]"
                >
                  Sync Later
                </Button>
                <Button
                  onClick={saveAndSync}
                  className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white px-6 py-3"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Sync
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sync Queue */}
        {formData.syncQueue.length > 0 && (
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
          <Button
            variant="outline"
            onClick={saveAndSync}
            className="flex-1 h-12 border-[#E5EAF0] hover:border-[#D9E2EC]"
          >
            Sync Later
          </Button>
          <Button
            onClick={saveAndSync}
            className="flex-1 h-12 bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}