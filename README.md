# Internal Tools Frontend

React frontend for the Internal Tools API, providing interfaces for KYC review, refunds management, and feature flags administration.

## Features

- **Authentication Simulation**: Login screen with role selection for testing different user permissions
- **KYC Review Queue**: View and decide on KYC cases with role-based data access
- **Refunds Dashboard**: Create and manage refund requests with separation of duties enforcement
- **Feature Flags Admin**: Manage feature flags across environments with toggle functionality
- **Role-Based Access Control**: Frontend enforces role restrictions alongside backend API

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Prerequisites

The backend API must be running on `http://localhost:4000`. See the backend README for setup instructions.

## Usage

1. Open the application in your browser
2. Select a user from the login screen to simulate authentication
3. Navigate to the appropriate dashboard based on your role:
   - **compliance_analyst/compliance_manager** → KYC Review Queue
   - **support_agent/support_manager** → Refunds Dashboard
   - **engineer** → Feature Flags Admin

## Role-Based Features

### Compliance Analyst
- View only assigned KYC cases
- See masked tax IDs
- Decide on assigned cases

### Compliance Manager
- View all KYC cases
- See full tax IDs
- Reassign and escalate cases
- Manage saved views

### Support Agent
- Create refund requests
- Request approval for refunds
- Cannot approve refunds

### Support Manager
- Create refund requests
- Request and approve refunds
- Enforced separation of duties for $500+ refunds

### Engineer
- Create, update, and delete feature flags
- Toggle feature flags on/off
- Manage rollout percentages

## API Integration

The frontend communicates with the backend API using the stubbed authentication headers:
- `X-User-Id`: The selected user's ID
- `X-User-Role`: The selected user's role

This matches the backend's stubbed authentication mechanism.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
├── context/         # React context (Auth)
├── lib/            # API client and utilities
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── App.tsx         # Main app with routing
├── main.tsx        # Entry point
└── index.css       # Global styles with Tailwind
```

## Notes

- This is a prototype frontend for demonstration purposes
- Authentication is simulated and matches the backend's stubbed auth
- In production, this would be replaced with real OIDC authentication
- The frontend enforces role-based access control as a UX enhancement, but the backend API is the authoritative source
