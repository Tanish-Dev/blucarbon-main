import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Activity
} from 'lucide-react';
import MetricTile from '../components/MetricTile';
import Chip from '../components/Chip';

export default function DMRVStudio() {
  const [layers, setLayers] = useState({
    baseline: { visible: true, source: 'Sentinel-2', date: '2023-01-15' },
    monitoring: { visible: true, source: 'Sentinel-2', date: '2024-01-15' },
    delta: { visible: true, calculated: true },
    uav: { visible: false, source: 'UAV Orthomosaic', date: '2024-02-01' },
    waterMask: { visible: false },
    cloudMask: { visible: true }
  });

  const [showPreview, setShowPreview] = useState(false);

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({
      ...prev,
      [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible }
    }));
  };

  const kpiData = {
    extentDelta: { value: 12.4, unit: "ha", label: "Extent Δ", trend: "up" },
    biomassProxy: { value: 8.6, unit: "%", label: "Biomass proxy", trend: "up" },
    confidence: { value: 0.72, unit: "", label: "Confidence" },
    uncertainty: { value: "U2", unit: "", label: "Uncertainty Class" }
  };

  return (
    <div className="h-screen bg-[#F7F8FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5EAF0] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A0F1C] leading-tight tracking-tight">
              dMRV Studio
            </h1>
            <p className="text-[#475569] mt-1">
              Generate MRV reports with satellite and UAV analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-[#E5EAF0] hover:border-[#D9E2EC]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Attach Dataset
            </Button>
            <Button 
              className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate MRV Report
            </Button>
          </div>
        </div>
      </div>

      {/* Three-pane layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Layers */}
        <div className="w-80 bg-white border-r border-[#E5EAF0] flex flex-col">
          <div className="p-6 border-b border-[#E5EAF0]">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-[#0A6BFF]" />
              Layers
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
                      <p className="font-medium text-[#0A0F1C]">Delta</p>
                      <p className="text-xs text-[#65728A]">Calculated change</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-r from-[#EF4444] to-[#10B981] rounded-sm"></div>
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
                MASKS
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
            <div className="h-full bg-gradient-to-br from-[#E0F2FE] via-[#ECFDF5] to-[#FEF3C7] relative">
              {/* Map placeholder with layers visualization */}
              <div className="absolute inset-4">
                {/* Baseline layer */}
                {layers.baseline.visible && (
                  <div className="absolute inset-0 bg-[#10B981]/20 rounded-lg"></div>
                )}
                
                {/* Monitoring layer */}
                {layers.monitoring.visible && (
                  <div className="absolute inset-2 bg-[#0A6BFF]/20 rounded-lg"></div>
                )}
                
                {/* Change areas */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-[#10B981] rounded-lg opacity-60 animate-pulse"></div>
                <div className="absolute bottom-12 left-12 w-24 h-12 bg-[#1E9E6A] rounded-lg opacity-60 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-[#F59E0B] rounded-lg opacity-60 animate-pulse"></div>
                
                {/* Center info */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
                    <Map className="w-12 h-12 text-[#0A6BFF] mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-[#0A0F1C] mb-2">
                      Godavari Estuary AOI
                    </h3>
                    <p className="text-sm text-[#475569] mb-4">126 ha • VM0033</p>
                    <div className="flex items-center gap-2 text-xs text-[#65728A]">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span>Gain +12.4 ha</span>
                      <div className="w-2 h-2 bg-[#F59E0B] rounded-full ml-2"></div>
                      <span>Change detected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="w-80 bg-white border-l border-[#E5EAF0] flex flex-col">
          <div className="p-6 border-b border-[#E5EAF0]">
            <h2 className="text-lg font-semibold text-[#0A0F1C] mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#0A6BFF]" />
              Analysis
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* KPIs */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-4">
                KEY METRICS
              </h3>
              <div className="space-y-3">
                {Object.entries(kpiData).map(([key, metric]) => (
                  <MetricTile key={key} metric={metric} compact />
                ))}
              </div>
            </div>

            {/* Time Series */}
            <div>
              <h3 className="text-sm font-semibold text-[#65728A] uppercase tracking-wider mb-4">
                TIME SERIES
              </h3>
              <div className="bg-[#F7F8FA] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#0A0F1C]">Biomass Trend</span>
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>
                {/* Simple sparkline representation */}
                <div className="h-16 flex items-end justify-between gap-1">
                  {[0.6, 0.7, 0.65, 0.8, 0.85, 0.9, 0.95, 1.0].map((height, i) => (
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

            {/* Actions */}
            <div className="pt-4 border-t border-[#E5EAF0] space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-[#E5EAF0] hover:border-[#D9E2EC]"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#E5EAF0] hover:border-[#D9E2EC]"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Validator
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
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
                  <p className="text-[#475569] mb-4">Mangrove Restoration — Godavari Estuary</p>
                  <div className="flex justify-center gap-2">
                    <Chip status="VM0033">VM0033</Chip>
                    <Chip status="Vintage 2024">2024</Chip>
                    <Chip status="Monitoring">Verified</Chip>
                  </div>
                </div>

                {/* Map Thumbnail */}
                <div className="bg-gradient-to-br from-[#E0F2FE] to-[#ECFDF5] rounded-xl h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-[#0A6BFF] mx-auto mb-2" />
                    <p className="text-[#475569]">Area of Interest Map</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Data Sources</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Sentinel-2 Optical (2023-2024)</li>
                      <li>• Sentinel-1 SAR (2023-2024)</li>
                      <li>• UAV Orthomosaic (Feb 2024)</li>
                      <li>• Field measurements (126 plots)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Methods</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• NDVI time series analysis</li>
                      <li>• Change detection algorithms</li>
                      <li>• Biomass proxy modeling</li>
                      <li>• Uncertainty quantification</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">QA/QC</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Cloud masking applied</li>
                      <li>• Geometric correction verified</li>
                      <li>• Field validation completed</li>
                      <li>• Statistical significance tested</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#F7F8FA] rounded-xl p-4">
                    <h3 className="font-semibold text-[#0A0F1C] mb-3">Uncertainty</h3>
                    <ul className="text-sm text-[#475569] space-y-1">
                      <li>• Classification: U2</li>
                      <li>• Confidence level: 72%</li>
                      <li>• Error bounds: ±2.1 ha</li>
                      <li>• Monte Carlo validated</li>
                    </ul>
                  </div>
                </div>

                {/* Hash */}
                <div className="bg-[#F7F8FA] rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-[#65728A]" />
                    <span className="text-sm font-medium text-[#65728A]">MRV Hash</span>
                  </div>
                  <code className="text-xs text-[#0A0F1C] bg-white px-3 py-1 rounded font-mono">
                    0x8f9c1a7b23d4e567f890a1b2c3d4e5f6789abcdef123456789abcdef0123bd3a
                  </code>
                </div>
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
                <Button 
                  variant="outline"
                  className="border-[#E5EAF0] hover:border-[#D9E2EC]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Validator
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}