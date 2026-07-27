# Internal Tools Frontend - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Backend API must be running on `http://localhost:4000`
- Node.js and npm installed

### Setup Steps

1. **Navigate to frontend directory:**
   ```bash
   cd /Users/justinbkim/internal-tools-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:5174` (or next available port)

## 🎨 Design Features

### Modern Fintech Aesthetic
- **Color Scheme**: Professional gray/indigo/emerald/amber palette
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Card-based layout with subtle shadows
- **Responsiveness**: Mobile and desktop optimized

### Custom CSS Components
- `.btn-primary` - Primary action buttons (indigo)
- `.btn-secondary` - Secondary buttons (white with border)
- `.btn-danger` - Destructive actions (red)
- `.btn-success` - Success actions (emerald)
- `.card` - Content containers with consistent styling
- `.input-field` - Form inputs with focus states
- `.select-field` - Dropdowns with consistent styling

## 📱 Dashboard Features

### Login Page
- Gradient background with branded shield icon
- User selection with role information
- Color-coded role badges
- Professional loading spinner
- Responsive design

### KYC Dashboard
- **Stats Cards**: Total cases, in review, approved, high risk
- **Search**: Filter by applicant name or email
- **Status Filter**: Filter by KYC status
- **Risk Scoring**: Color-coded risk scores (green/amber/red)
- **Status Icons**: Visual indicators for each status
- **Actions**: Approve/reject buttons with proper permissions

### Refunds Dashboard
- **Stats Cards**: Total refunds, pending, approved, high value
- **Search**: Filter by customer name or transaction ID
- **Status Filter**: Filter by refund status
- **Amount Display**: Color-coded amounts (green/amber/red)
- **Transaction IDs**: Monospace font for readability
- **Separation of Duties**: High-value refund warnings

### Feature Flags Dashboard
- **Stats Cards**: Total flags, enabled, in rollout, production
- **Search**: Filter by key or description
- **Environment Filter**: Filter by dev/staging/prod
- **Toggle Controls**: Enable/disable functionality
- **Rollout Indicators**: Visual percentage display
- **Environment Badges**: Color-coded by environment

## 🔐 Authentication Flow

1. **Login**: Select user from dropdown (simulated auth)
2. **Role-Based Routing**: Automatic navigation based on role
3. **Session Management**: User info stored in localStorage
4. **API Headers**: X-User-Id and X-User-Role automatically added
5. **Logout**: Clear session and return to login

## 🎯 Role-Based Access Control

### Compliance Roles
- **compliance_analyst**: Access to KYC dashboard, assigned cases only
- **compliance_manager**: Access to KYC dashboard, all cases

### Support Roles
- **support_agent**: Access to refunds dashboard, request only
- **support_manager**: Access to refunds dashboard, approve functionality

### Engineering Roles
- **engineer**: Access to feature flags dashboard, full management

## 🎨 Custom Styling

### Color System
- **Primary**: Indigo-600 for main actions
- **Success**: Emerald-600 for positive states
- **Warning**: Amber-600 for caution states
- **Danger**: Red-600 for destructive actions
- **Neutral**: Gray-500 for secondary elements

### Status Colors
- **New**: Gray-100/gray-700
- **In Review**: Blue-100/blue-700
- **Pending Info**: Amber-100/amber-700
- **Approved**: Emerald-100/emerald-700
- **Rejected**: Red-100/red-700
- **Escalated**: Purple-100/purple-700

### Risk/Amount Colors
- **Low**: Emerald-600/emerald-50
- **Medium**: Amber-600/amber-50
- **High**: Red-600/red-50

## 📊 Data Flow

### API Integration
1. **Request**: Frontend calls API via axios
2. **Headers**: Auth headers automatically added by interceptor
3. **Response**: Data processed and displayed in components
4. **Error Handling**: Console logging with user feedback
5. **Loading States**: Professional spinners during data fetch

### State Management
- **Local State**: React useState for component state
- **Auth State**: Context API for user authentication
- **API State**: Direct API calls with response handling
- **Filter State**: Local state for search and filters

## 🐛 Troubleshooting

### Common Issues

**Blank Page**
- Ensure backend is running on port 4000
- Check browser console for errors
- Verify API connectivity with curl

**User Dropdown Empty**
- Check backend `/users` endpoint
- Verify auth headers are being sent
- Check browser network tab for failed requests

**Styling Issues**
- Ensure Tailwind CSS v4 is installed
- Check postcss.config.js configuration
- Verify @tailwindcss/postcss is being used

**Build Errors**
- Run `npm run build` to check TypeScript errors
- Verify all imports are correct
- Check for duplicate imports

## 🚀 Production Build

```bash
npm run build
```

Build output will be in `dist/` directory.

### Production Deployment
1. Build the frontend: `npm run build`
2. Serve static files with nginx or similar
3. Configure API endpoint to production backend
4. Enable HTTPS
5. Set up proper environment variables

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (stacked layouts)
- **Tablet**: 640px - 1024px (adjusted layouts)
- **Desktop**: > 1024px (full layouts)

### Mobile Optimizations
- Stacked stats cards
- Full-width inputs
- Horizontal scroll for tables
- Touch-friendly buttons

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run preview` - Preview production build

### Hot Module Replacement
- Fast refresh for React components
- CSS changes update without reload
- State preserved during HMR

## 📞 Integration Notes

### Backend Integration
- **Base URL**: `http://localhost:4000`
- **Timeout**: Default axios timeout
- **Retry**: No automatic retry (handled by user)
- **Error Handling**: Try-catch with console logging

### API Client Configuration
```typescript
const API_BASE_URL = 'http://localhost:4000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Auth Interceptor
```typescript
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  if (userId && userRole) {
    config.headers['X-User-Id'] = userId;
    config.headers['X-User-Role'] = userRole;
  }
  
  return config;
});
```

---

**Generated with [Devin](https://devin.ai)**
