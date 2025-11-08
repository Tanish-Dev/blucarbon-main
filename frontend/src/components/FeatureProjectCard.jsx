import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import MetricTile from './MetricTile';
import Chip from './Chip';

export default function FeatureProjectCard({ project }) {
  const { title, description, image, images, metrics, status, methodology, vintage } = project;
  
  // Use images array if available, otherwise fall back to single image
  const projectImage = images && images.length > 0 ? images[0] : image;
  const hasImage = projectImage && projectImage !== '';
  
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
                metrics && metrics[key] ? (
                  <MetricTile key={key} metric={metrics[key]} compact />
                ) : (
                  <div key={key} className="text-center text-slate-500">No data available</div>
                )
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
            {hasImage ? (
              <img 
                src={projectImage} 
                alt={title}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-80 bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center"><svg class="w-16 h-16 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                }}
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
                <svg className="w-16 h-16 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Navigation Arrows (ghost style like Solvance) */}
            {hasImage && (
              <>
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
              </>
            )}
            
            {/* Photo count badge */}
            {images && images.length > 1 && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {images.length} photos
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}