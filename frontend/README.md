# 🎨 BluCarbon Frontend

> React-based frontend for the BluCarbon carbon credit management platform

## 📋 Overview

The BluCarbon frontend is a modern, responsive web application built with React 19 and Tailwind CSS. It provides an intuitive interface for managing blue carbon projects, conducting digital MRV (Measurement, Reporting, and Verification), and trading carbon credits.

## 🛠 Tech Stack

- **React** 19.0.0 - UI framework
- **React Router DOM** 7.5.1 - Client-side routing
- **Tailwind CSS** 3.4.17 - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Leaflet** 1.9.4 - Interactive maps
- **Axios** 1.8.4 - HTTP client
- **React Hook Form** 7.56.2 - Form management
- **Zod** 3.24.4 - Schema validation
- **CRACO** 7.1.0 - Create React App configuration override

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (Radix UI)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.jsx
│   │   │   ├── select.jsx
│   │   │   ├── table.jsx
│   │   │   └── ... (30+ components)
│   │   ├── BrandLogo.jsx       # Logo component
│   │   ├── Chip.jsx            # Status chip component
│   │   ├── DashboardTour.jsx   # Interactive guided tour
│   │   ├── FeatureProjectCard.jsx # Project card component
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   ├── MetricTile.jsx      # Dashboard metric tile
│   │   ├── PolygonMapEditor.jsx # AOI polygon editor
│   │   ├── ProjectMap.jsx      # Leaflet map component
│   │   ├── ProtectedRoute.jsx  # Route authentication guard
│   │   ├── SatelliteComparisonMap.jsx # Before/after satellite view
│   │   └── SatelliteMapViewer.jsx     # Sentinel Hub viewer
│   ├── contexts/
│   │   └── AuthContext.js      # Authentication state management
│   ├── hooks/
│   │   └── use-toast.js        # Toast notification hook
│   ├── lib/
│   │   └── utils.js            # Utility functions (cn, etc.)
│   ├── pages/                  # Page components
│   │   ├── Admin.jsx           # Admin dashboard
│   │   ├── Credits.jsx         # Carbon credits management
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── DMRVStudio.jsx      # Digital MRV studio
│   │   ├── FieldCapture.jsx    # Field data collection
│   │   ├── Login.jsx           # Login page
│   │   ├── Marketplace.jsx     # Carbon credit marketplace
│   │   ├── ProjectDetail.jsx   # Project details page
│   │   ├── Projects.jsx        # Project listing
│   │   ├── Register.jsx        # User registration
│   │   └── Settings.jsx        # User settings
│   ├── services/
│   │   ├── api.js              # API client service
│   │   ├── satelliteIntegration.js # Satellite data service
│   │   └── sentinelHub.js      # Sentinel Hub API integration
│   ├── styles/
│   │   ├── map.css             # Leaflet map styles
│   │   └── solvance-theme.css  # Custom theme variables
│   ├── App.css                 # Global app styles
│   ├── App.js                  # Main app component
│   ├── index.css               # Global CSS & Tailwind imports
│   ├── index.js                # App entry point
│   └── mock.js                 # Mock data for development
├── components.json             # shadcn/ui configuration
├── craco.config.js             # CRACO configuration
├── jsconfig.json               # JavaScript configuration
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running (see main README)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
# or: npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SENTINEL_HUB_INSTANCE_ID=your-instance-id
```

### Development

```bash
# Start development server
yarn start
# or: npm start
```

The app will open at `http://localhost:3000`

### Build

```bash
# Create production build
yarn build
# or: npm run build
```

Build output will be in the `build/` directory.

### Testing

```bash
# Run tests
yarn test
# or: npm test
```

## 🎨 Component Library

The app uses a comprehensive component library based on Radix UI:

### UI Components (src/components/ui/)
- **Accordion** - Collapsible content sections
- **Alert Dialog** - Modal confirmation dialogs
- **Avatar** - User profile images
- **Badge** - Status indicators
- **Button** - Interactive buttons with variants
- **Card** - Content containers
- **Checkbox** - Form checkboxes
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Contextual menus
- **Input** - Text input fields
- **Label** - Form labels
- **Select** - Dropdown selects
- **Table** - Data tables
- **Tabs** - Tabbed interfaces
- **Toast** - Notification toasts
- **Tooltip** - Hover tooltips
- And 20+ more components...

### Feature Components
- **Layout** - Main app layout with navigation
- **ProjectMap** - Interactive Leaflet map for project locations
- **SatelliteMapViewer** - Sentinel Hub satellite imagery viewer
- **SatelliteComparisonMap** - Before/after comparison tool
- **PolygonMapEditor** - Draw and edit area of interest polygons
- **DashboardTour** - Guided tour using React Joyride
- **ProtectedRoute** - Authentication-required routes

## 📱 Pages

### Public Pages
- **Login** - User authentication
- **Register** - New user registration

### Protected Pages
- **Dashboard** - Overview with metrics and recent activity
- **Projects** - Browse and search carbon projects
- **Project Detail** - Detailed project view with maps
- **DMRV Studio** - Digital MRV with satellite imagery analysis
- **Field Capture** - Mobile-friendly field data collection
- **Credits** - Carbon credit management
- **Marketplace** - Buy/sell carbon credits
- **Settings** - User preferences
- **Admin** - Admin panel (admin role only)

## 🗺️ Map Integration

### Leaflet Configuration

The app uses React Leaflet for interactive maps with:
- **Base Map**: OpenStreetMap tiles
- **Fullscreen Control**: Leaflet.fullscreen plugin
- **Custom Markers**: Project location markers
- **Polygon Drawing**: Area of interest editing
- **GPS Tracking**: Field data location capture

### Satellite Imagery

Integration with Sentinel Hub for:
- **True Color RGB** imagery
- **NDVI** vegetation index
- **Multi-temporal** analysis
- **Custom date ranges**
- **High-resolution** satellite data

## 🎨 Styling & Theming

### Tailwind CSS

Custom configuration with:
- Extended color palette
- Custom animations
- Responsive breakpoints
- Dark mode support (via next-themes)

### Custom Theme

The `solvance-theme.css` provides:
- CSS custom properties for colors
- Global component styles
- Responsive utilities

### Component Styling

Uses `class-variance-authority` for type-safe component variants:

```jsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      }
    }
  }
)
```

## 🔌 API Integration

### API Service (src/services/api.js)

Centralized Axios client with:
- JWT token management
- Automatic token refresh
- Request/response interceptors
- Error handling

```javascript
// Example usage
import api from './services/api';

const projects = await api.get('/projects');
const project = await api.post('/projects', projectData);
```

### Authentication Context

Global auth state management:
- User login/logout
- Token storage
- Protected route guards
- Role-based access control

## 📦 Key Dependencies

### Core
- `react` 19.0.0
- `react-dom` 19.0.0
- `react-router-dom` 7.5.1

### UI Framework
- `@radix-ui/*` - 30+ component primitives
- `tailwindcss` 3.4.17
- `tailwindcss-animate` 1.0.7
- `lucide-react` 0.507.0 - Icons

### Maps & Visualization
- `leaflet` 1.9.4
- `react-leaflet` 5.0.0
- `leaflet.fullscreen` 4.0.0

### Forms & Validation
- `react-hook-form` 7.56.2
- `zod` 3.24.4
- `@hookform/resolvers` 5.0.1

### Utilities
- `axios` 1.8.4
- `date-fns` 4.1.0
- `class-variance-authority` 0.7.1
- `clsx` 2.1.1
- `tailwind-merge` 3.2.0

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

```bash
# Build command
npm run build

# Publish directory
build
```

### Environment Variables

Set these in your deployment platform:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SENTINEL_HUB_INSTANCE_ID` - Sentinel Hub instance

## 🔧 Configuration Files

### craco.config.js
Custom Create React App configuration without ejecting

### jsconfig.json
Path aliases for cleaner imports:
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

### tailwind.config.js
Tailwind CSS customization with theme extensions

### components.json
shadcn/ui configuration for component generation

## 🤝 Contributing

1. Follow the existing code structure
2. Use the established component patterns
3. Maintain responsive design
4. Test on multiple devices
5. Follow accessibility best practices

## 📝 Code Style

- **ESLint** configuration included
- **Prettier** recommended for formatting
- Use functional components with hooks
- Follow React best practices
- Keep components focused and small

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Map not loading**
- Check Leaflet CSS is imported in index.css
- Verify OpenStreetMap tiles are accessible

**API connection issues**
- Verify backend is running
- Check REACT_APP_API_URL in .env
- Check browser console for CORS errors

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [React Hook Form](https://react-hook-form.com/)

---

For the complete project documentation, see the [main README](../README.md)
