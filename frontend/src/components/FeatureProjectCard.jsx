import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import MetricTile from './MetricTile';
import Chip from './Chip';

export default function FeatureProjectCard({ project }) {
  const { title, description, image, metrics, status, methodology, vintage } = project;
  
  const metricKeys = ['hectaresMonitored', 'creditsIssued', 'creditsRetired', 'biomassProxy', 'confidence', 'extentDelta'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-slate-300 transition-all hover:shadow-lg duration-200">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
              {title}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              {description}
            </p>
            
            {/* Chips Row */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Chip status={methodology}>{methodology}</Chip>
              <Chip status={status}>{status}</Chip>
              <Chip status={vintage}>{vintage}</Chip>
            </div>
          </div>

          {/* Results Section */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              RESULT
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metricKeys.map((key) => (
                <MetricTile key={key} metric={metrics[key]} compact />
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button className="bg-[#00e07a] hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all duration-200">
              Open Project
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-80 object-cover"
            />
            
            {/* Navigation Arrows (ghost style like Solvance) */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg">
                <ChevronLeft className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg">
                <ChevronRight className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}