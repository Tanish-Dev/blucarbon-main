# DMRV Studio - Visual Workflow Guide

## 🎯 Overview
This document provides a visual representation of the DMRV Studio workflow for validators.

---

## 📊 Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DMRV STUDIO                              │
│                     Validation Platform                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │         1. VALIDATION QUEUE VIEW             │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │  Search: [________________] 🔍         │ │
        │  │  Filter: [In Review ▼]                 │ │
        │  └────────────────────────────────────────┘ │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │ 🌳 Mangrove Restoration - Godavari    │ │
        │  │ 📍 125 ha │ 🌴 Mangrove │ 📄 VM0033  │ │
        │  │ ⏰ Created: Jan 8, 2024               │ │
        │  │                    [Review →]          │ │
        │  └────────────────────────────────────────┘ │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │ 🌊 Seagrass Conservation Project      │ │
        │  │ 📍 80 ha │ 🌿 Seagrass │ 📄 VM0007   │ │
        │  │ ⏰ Created: Jan 5, 2024               │ │
        │  │                    [Review →]          │ │
        │  └────────────────────────────────────────┘ │
        └─────────────────────────────────────────────┘
                              │
                   [Click Review →]
                              ▼
        ┌─────────────────────────────────────────────┐
        │      2. VALIDATION DASHBOARD (3-Panel)       │
        └─────────────────────────────────────────────┘

┌──────────────┬─────────────────────────┬──────────────────┐
│  LEFT PANEL  │     CENTER PANEL        │   RIGHT PANEL    │
│   Layers     │         Map             │    Analysis      │
├──────────────┼─────────────────────────┼──────────────────┤
│              │                         │                  │
│ 🛰️ TEMPORAL  │  ┌───────────────────┐  │ 📊 KEY METRICS   │
│ ☑ Baseline   │  │                   │  │ • Extent Δ      │
│ ☑ Monitoring │  │     🗺️ Project    │  │   +12.4 ha      │
│ ☑ Delta      │  │       Map         │  │ • Biomass ↑     │
│              │  │                   │  │   +8.6%         │
│ 📈 ANALYSIS  │  │   [Visualization] │  │ • CO₂ Absorbed  │
│ ☐ NDVI       │  │                   │  │   245.6 tCO2e   │
│ ☐ RGB        │  │   🟢 Gain areas   │  │ • NDVI Change   │
│              │  │   🟡 Change areas │  │   +0.25         │
│ 🛰️ SOURCES   │  │                   │  │ • Confidence    │
│ • Sentinel-1 │  └───────────────────┘  │   85%           │
│ • Sentinel-2 │                         │                  │
│ ☐ UAV Data   │                         │ 📈 BIOMASS TREND │
│              │                         │ ▂▃▅▆▇█          │
│ 🎭 MASKS     │                         │                  │
│ ☐ Water      │                         │ ✅ QA/QC        │
│ ☑ Cloud      │                         │ • Cloud: 2.3%   │
│              │                         │ • Quality: High │
│              │                         │                  │
│              │                         │ 📝 NOTES        │
│              │                         │ [____________]  │
│              │                         │ [____________]  │
│              │                         │                  │
│              │                         │ 🎬 ACTIONS      │
│              │                         │ [✅ Approve]    │
│              │                         │ [❌ Reject]     │
│              │                         │ [👁️ Preview]    │
└──────────────┴─────────────────────────┴──────────────────┘
                              │
                   [Click Preview →]
                              ▼
        ┌─────────────────────────────────────────────┐
        │          3. MRV REPORT PREVIEW               │
        │                                              │
        │  ╔═══════════════════════════════════════╗  │
        │  ║         📄 dMRV REPORT                ║  │
        │  ║  Mangrove Restoration - Godavari      ║  │
        │  ║  [VM0033] [2024] [✅ Verified]        ║  │
        │  ╚═══════════════════════════════════════╝  │
        │                                              │
        │  ┌─────────────────────────────────────┐    │
        │  │  💚 CO₂ ABSORBED     245.6 tCO2e    │    │
        │  │  💙 AREA CHANGE      +12.4 ha       │    │
        │  │  🟡 CONFIDENCE       85%            │    │
        │  └─────────────────────────────────────┘    │
        │                                              │
        │  📊 Analysis Summary                         │
        │  • Baseline: Jan 2023                        │
        │  • Monitoring: Jan 2024                      │
        │  • Biomass: +8.6%                           │
        │  • NDVI: +0.25                              │
        │                                              │
        │  🔬 Data Sources    📐 Methods               │
        │  • Sentinel-2      • Change detection        │
        │  • Sentinel-1      • Biomass modeling        │
        │                    • Uncertainty calc        │
        │                                              │
        │  #️⃣ MRV HASH                                 │
        │  0x8f9c1a7b23d4e567f890a1b2c3d4e5f6...      │
        │                                              │
        │  [📥 Download PDF]    [🔐 Publish & Hash]   │
        └─────────────────────────────────────────────┘
                              │
                   [Click Approve/Reject]
                              ▼
        ┌─────────────────────────────────────────────┐
        │         4. PROJECT STATUS UPDATE             │
        │                                              │
        │  ✅ APPROVED                                 │
        │  Project moved to MONITORING phase           │
        │  Validator: validator@example.com            │
        │  Notes saved: "Excellent data quality..."    │
        │  MRV Hash: 0x8f9c1a7b...                    │
        │                                              │
        │         [Return to Queue ←]                  │
        └─────────────────────────────────────────────┘
```

---

## 🔄 State Flow Diagram

```
PROJECT LIFECYCLE IN DMRV STUDIO
═════════════════════════════════

  ┌─────────┐
  │  DRAFT  │ (Created in Field Capture)
  └────┬────┘
       │
       │ Submit for Review
       ▼
┌──────────────┐
│  IN_REVIEW   │ ◄── Appears in DMRV Validation Queue
└──────┬───────┘
       │
       │ Validator Opens Project
       ▼
┌─────────────────────────────┐
│  VALIDATION DASHBOARD       │
│  • Toggle layers            │
│  • View analysis            │
│  • Check calculations       │
│  • Add notes                │
│  • Generate MRV report      │
└──────┬──────────────────────┘
       │
       │ Validator Decision
       ▼
    ┌──┴──┐
    │     │
    ▼     ▼
┌───────┐ ┌──────────┐
│APPROVE│ │ REJECT   │
└───┬───┘ └────┬─────┘
    │          │
    │          │
    ▼          ▼
┌──────────┐ ┌─────────┐
│MONITORING│ │REJECTED │
└──────────┘ └─────────┘
    │          │
    │          └─► [End: Resubmit or Archive]
    │
    │ Monitoring Period
    ▼
┌──────────┐
│ ISSUED   │ (Credits Issued)
└──────────┘
```

---

## 🔢 Analysis Calculation Flow

```
SATELLITE DATA ANALYSIS PIPELINE
═══════════════════════════════

Input Data
──────────
┌─────────────────┐
│ Project Info    │
│ • Area: 125 ha  │
│ • Location      │
│ • Dates         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Satellite Data  │
│ • Sentinel-1    │
│ • Sentinel-2    │
│ • UAV (opt)     │
└────────┬────────┘
         │
         ▼
Processing Steps
────────────────
┌─────────────────────────────────┐
│ 1. Cloud Masking                │
│    Remove cloudy pixels         │
└───────────┬─────────────────────┘
            ▼
┌─────────────────────────────────┐
│ 2. Water Masking                │
│    Identify water bodies        │
└───────────┬─────────────────────┘
            ▼
┌─────────────────────────────────┐
│ 3. NDVI Calculation             │
│    NDVI = (NIR - RED)/(NIR+RED) │
└───────────┬─────────────────────┘
            ▼
┌─────────────────────────────────┐
│ 4. Change Detection             │
│    Delta = Monitoring - Baseline│
└───────────┬─────────────────────┘
            ▼
┌─────────────────────────────────┐
│ 5. Biomass Estimation           │
│    Using regression models      │
└───────────┬─────────────────────┘
            ▼
┌─────────────────────────────────┐
│ 6. CO₂ Calculation              │
│    CO₂ = Biomass × 3.67         │
└───────────┬─────────────────────┘
            ▼
Output Metrics
──────────────
┌─────────────────┐
│ • Area Δ       │  +12.4 ha
│ • Biomass ↑    │  +8.6%
│ • CO₂          │  245.6 tCO2e
│ • NDVI Δ       │  +0.25
│ • Confidence   │  85%
│ • Carbon Stock │  1250.5 tC
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MRV Report     │
│  + Hash         │
└─────────────────┘
```

---

## 🔐 MRV Hash Generation

```
MRV HASH CREATION PROCESS
═════════════════════════

Input Data
──────────
┌──────────────────────────────┐
│ Report Components:           │
│ • Project ID                 │
│ • Timestamp                  │
│ • Validator ID               │
│ • Analysis Results:          │
│   - Biomass: 8.6%           │
│   - CO₂: 245.6 tCO2e        │
│   - Area: +12.4 ha          │
│   - NDVI: +0.25             │
│   - Confidence: 0.85        │
│   - Carbon Stock: 1250.5    │
└──────────┬───────────────────┘
           │
           │ JSON.stringify()
           ▼
┌──────────────────────────────┐
│ Serialized String            │
│ {"project_id":"abc123",...}  │
└──────────┬───────────────────┘
           │
           │ SHA-256 Hash
           ▼
┌──────────────────────────────┐
│ Hash Output                  │
│ 0x8f9c1a7b23d4e567f890a1... │
└──────────┬───────────────────┘
           │
           │ Store in Database
           ▼
┌──────────────────────────────┐
│ • projects.mrv_hash          │
│ • mrv_reports collection     │
└──────────────────────────────┘
           │
           │ Optional: Blockchain
           ▼
┌──────────────────────────────┐
│ Smart Contract Storage       │
│ (Future Enhancement)         │
└──────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
DMRVStudio Component
├── Header
│   ├── Title
│   ├── Back Button (validation view)
│   └── Action Buttons
│       ├── Re-analyze
│       └── Generate Report
│
├── Queue View (when view='queue')
│   ├── Filters Bar
│   │   ├── Search Input
│   │   └── Status Dropdown
│   │
│   └── Project List
│       └── Project Card []
│           ├── Icon
│           ├── Title & Description
│           ├── Metadata Grid
│           │   ├── Area
│           │   ├── Ecosystem
│           │   ├── Methodology
│           │   └── Vintage
│           └── Status Chips
│
└── Validation View (when view='validation')
    ├── Left Panel (Layers)
    │   ├── Section: Temporal Data
    │   │   ├── Baseline Layer Toggle
    │   │   ├── Monitoring Layer Toggle
    │   │   └── Delta Layer Toggle
    │   │
    │   ├── Section: Analysis Layers
    │   │   ├── NDVI Toggle
    │   │   └── RGB Toggle
    │   │
    │   ├── Section: Data Sources
    │   │   ├── Sentinel-1
    │   │   ├── Sentinel-2
    │   │   └── UAV Toggle
    │   │
    │   └── Section: Masks
    │       ├── Water Mask Toggle
    │       └── Cloud Mask Toggle
    │
    ├── Center Panel (Map)
    │   └── ProjectMap Component
    │       └── Layered Visualization
    │
    ├── Right Panel (Analysis)
    │   ├── Analysis Status
    │   │
    │   ├── Section: Key Metrics
    │   │   ├── MetricTile: Extent Delta
    │   │   ├── MetricTile: Biomass
    │   │   ├── MetricTile: CO₂
    │   │   ├── MetricTile: NDVI
    │   │   ├── MetricTile: Carbon Stock
    │   │   ├── MetricTile: Confidence
    │   │   └── MetricTile: Uncertainty
    │   │
    │   ├── Section: Time Series
    │   │   └── Biomass Trend Chart
    │   │
    │   ├── Section: Quality Assurance
    │   │   ├── Cloud Coverage
    │   │   ├── Data Quality
    │   │   └── Uncertainty
    │   │
    │   ├── Validation Notes Textarea
    │   │
    │   └── Action Buttons
    │       ├── Approve Button
    │       ├── Reject Button
    │       └── Preview Report Button
    │
    └── MRV Report Modal (when showPreview=true)
        ├── Header
        ├── Key Results Dashboard
        ├── Analysis Summary
        ├── Technical Sections Grid
        ├── MRV Hash Display
        ├── Validator Notes
        └── Footer Actions
            ├── Download PDF
            └── Publish & Hash
```

---

## 📱 Responsive Behavior

```
DESKTOP (>1200px)
┌────────────────────────────────────────────────┐
│ ┌──────┬──────────────────┬─────────────────┐ │
│ │Left  │     Center       │     Right       │ │
│ │Panel │      Map         │    Analysis     │ │
│ │320px │     Flexible     │     384px       │ │
│ └──────┴──────────────────┴─────────────────┘ │
└────────────────────────────────────────────────┘

TABLET (768px - 1200px)
┌────────────────────────────────────┐
│ ┌──────┬──────────────────┐        │
│ │Left  │     Center       │        │
│ │Panel │      Map         │        │
│ │280px │    Flexible      │        │
│ └──────┴──────────────────┘        │
│ ┌─────────────────────────────┐    │
│ │     Analysis Panel          │    │
│ │     (Below Map)             │    │
│ └─────────────────────────────┘    │
└────────────────────────────────────┘

MOBILE (<768px)
┌──────────────────┐
│ Tabs:            │
│ [Layers][Map][📊]│
├──────────────────┤
│                  │
│  Active Tab      │
│  Content         │
│                  │
└──────────────────┘
```

---

## 🎯 User Interactions

```
LAYER TOGGLES
═════════════
User clicks switch → Layer visibility changes → Map updates

ANALYSIS
════════
Project selected → Auto-analyze → Display metrics
Re-analyze clicked → Recalculate → Update metrics

VALIDATION
══════════
Add notes → Enter text → Store in state
Approve → Update DB → Toast → Return to queue
Reject → Update DB → Toast → Return to queue

REPORT
══════
Preview → Show modal → Display data
Download → Generate PDF → Download file
Publish → Generate hash → Store → Blockchain (future)
```

---

This visual guide complements the technical documentation and helps understand the flow of the DMRV Studio validation platform.
