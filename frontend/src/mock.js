// Mock data for Blue Carbon Registry
export const mockProject = {
  id: "project-1",
  title: "Mangrove Restoration — Godavari Estuary",
  description: "Large-scale mangrove restoration and conservation project in the Godavari estuary, focusing on blue carbon sequestration and coastal protection.",
  location: "Andhra Pradesh, India",
  status: "Monitoring",
  vintage: "2024",
  methodology: "VM0033",
  organization: "CoastalCare NGO",
  image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
  
  metrics: {
    hectaresMonitored: { value: 126, unit: "ha", label: "Hectares Monitored" },
    creditsIssued: { value: 25.0, unit: "tCO2e", label: "Credits Issued" },
    creditsRetired: { value: 0.5, unit: "tCO2e", label: "Credits Retired" },
    biomassProxy: { value: 8.6, unit: "%", label: "Biomass proxy", trend: "up" },
    confidence: { value: 0.72, unit: "", label: "Confidence" },
    extentDelta: { value: 12.4, unit: "ha", label: "Extent Δ", trend: "up" }
  },
  
  mrvHash: "0x8f9c1a7b23d4e567f890a1b2c3d4e5f6789abcdef123456789abcdef0123bd3a",
  
  cobenefits: ["Coastal Protection", "Biodiversity", "Community Livelihoods", "Water Quality"]
};

export const mockActivity = [
  { id: 1, text: "Plot batch uploaded", timestamp: "2 mins ago" },
  { id: 2, text: "MRV Report v0.3 approved", timestamp: "1 hr ago" },
  { id: 3, text: "0.5 tCO2e retired", timestamp: "Yesterday" },
  { id: 4, text: "Field data synchronized", timestamp: "2 days ago" },
  { id: 5, text: "Baseline measurements completed", timestamp: "1 week ago" }
];

export const mockProjects = [
  mockProject,
  {
    id: "project-2",
    title: "Seagrass Conservation — Tamil Nadu",
    description: "Seagrass meadow restoration project focusing on carbon sequestration and marine ecosystem restoration.",
    location: "Tamil Nadu, India",
    status: "In Review",
    vintage: "2024",
    methodology: "VM0033",
    organization: "Marine Foundation",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1200&auto=format&fit=crop",
    metrics: {
      hectaresMonitored: { value: 89, unit: "ha", label: "Hectares Monitored" },
      creditsIssued: { value: 18.5, unit: "tCO2e", label: "Credits Issued" },
      creditsRetired: { value: 0, unit: "tCO2e", label: "Credits Retired" },
      biomassProxy: { value: 12.3, unit: "%", label: "Biomass proxy", trend: "up" },
      confidence: { value: 0.68, unit: "", label: "Confidence" },
      extentDelta: { value: 8.7, unit: "ha", label: "Extent Δ", trend: "up" }
    }
  }
];

export const mockCredits = [
  {
    id: "#10231",
    vintage: "2024",
    methodology: "VM0033",
    amount: 25.0,
    status: "Issued",
    projectId: "project-1",
    metadata: {
      mrv_hash: "0x8f9c1a7b23d4e567f890a1b2c3d4e5f6789abcdef123456789abcdef0123bd3a",
      data_bundle_uri: "ipfs://QmX4h7...",
      methodology_id: "VM0033_v2.1",
      project_geohash: "tdr1y4k8g9j2",
      uncertainty_class: "U2"
    }
  },
  {
    id: "#10232",
    vintage: "2024",
    methodology: "VM0033",
    amount: 12.5,
    status: "Draft",
    projectId: "project-2",
    metadata: {
      mrv_hash: "0x7e8d9c6b54a321f890b1c2d3e4f5g678h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4",
      data_bundle_uri: "ipfs://QmY5k8...",
      methodology_id: "VM0033_v2.1",
      project_geohash: "tdr1y4k8g9j3",
      uncertainty_class: "U2"
    }
  }
];

export const mockValidators = [
  {
    id: "validator-1",
    name: "Dr. Sarah Chen",
    email: "s.chen@carbonvalidation.org",
    skills: ["mangrove", "SAR", "UAV"],
    availability: "Available",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3"
  },
  {
    id: "validator-2", 
    name: "Prof. Michael Rodriguez",
    email: "m.rodriguez@bluecarbon.net",
    skills: ["seagrass", "methodology", "QA/QC"],
    availability: "Busy",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3"
  }
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", path: "/" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "field-capture", label: "Field Capture", path: "/create-project" },
  { id: "dmrv-studio", label: "dMRV Studio", path: "/dmrv-studio" },
  { id: "credits", label: "Credits", path: "/credits" },
  { id: "marketplace", label: "Marketplace", path: "/marketplace" },
  { id: "admin", label: "Admin", path: "/admin" },
  { id: "settings", label: "Settings", path: "/settings" }
];