import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import MetricTile from '../components/MetricTile';
import { Badge } from '../components/ui/badge';
import { mockCredits, mockProjects } from '../mock';
import { Plus, Download, Filter, Search } from 'lucide-react';

export default function Credits() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Calculate aggregate metrics from mock data
  const calculateMetrics = () => {
    const totalCredits = mockProjects.reduce((sum, project) => 
      sum + (project.metrics?.creditsIssued?.value || 0), 0
    );
    
    const issuedCredits = mockProjects.reduce((sum, project) => 
      sum + (project.metrics?.creditsIssued?.value || 0), 0
    );
    
    const retiredCredits = mockProjects.reduce((sum, project) => 
      sum + (project.metrics?.creditsRetired?.value || 0), 0
    );

    return {
      total: { value: totalCredits, unit: "", label: "TOTAL CREDITS (TCO2E)" },
      issued: { value: issuedCredits, unit: "", label: "ISSUED" },
      retired: { value: retiredCredits, unit: "", label: "RETIRED" }
    };
  };

  const metrics = calculateMetrics();

  const filteredCredits = mockCredits.filter(credit => {
    const matchesSearch = credit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.methodology.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || credit.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'issued':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'retired':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Credits Monitor
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor and manage carbon credit issuance and retirement
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Issue Credits
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:border-slate-300 transition-colors">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {metrics.total.value}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {metrics.total.label}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:border-slate-300 transition-colors">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {metrics.issued.value}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {metrics.issued.label}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:border-slate-300 transition-colors">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {metrics.retired.value}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {metrics.retired.label}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Registry */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Credit Registry
            </h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search credits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="retired">Retired</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Credit Registry Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {filteredCredits.map((credit) => (
              <div key={credit.id} className="border-b border-slate-100 last:border-b-0 p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {credit.id}
                      </h3>
                      <Badge className={`${getStatusColor(credit.status)} font-medium`}>
                        {credit.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 uppercase tracking-wide font-medium mb-1">
                          MRV HASH
                        </div>
                        <div className="text-slate-900 font-mono">
                          {credit.metadata.mrv_hash.slice(0, 20)}...
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-slate-500 uppercase tracking-wide font-medium mb-1">
                          DATA BUNDLE
                        </div>
                        <div className="text-slate-900 font-mono">
                          {credit.metadata.data_bundle_uri.slice(0, 20)}...
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-slate-500 uppercase tracking-wide font-medium mb-1">
                          UNCERTAINTY CLASS
                        </div>
                        <div className="text-slate-900 font-medium">
                          {credit.metadata.uncertainty_class}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-sm text-slate-500 mb-1">
                      {credit.vintage} • {credit.methodology} • {credit.amount} tCO2e
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredCredits.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-slate-400 mb-2">No credits found</div>
            <div className="text-sm text-slate-500">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
