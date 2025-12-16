# RouteXpert Frontend

React frontend application for the RouteXpert fleet management system.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **Animations**: Lottie (DotLottie React)

## Prerequisites

- Node.js v20 or higher
- npm v9 or higher
- Backend API running (see backend README)

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update the API URL accordingly:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Access the app at `http://localhost:5173`

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting
```bash
npm run lint
```

## Project Structure

```
frontend/
├── public/
│   └── truck_animation.json    # Lottie animation
├── src/
│   ├── api/
│   │   └── axios.js            # Axios instance & interceptors
│   ├── assets/                 # Static assets
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── StatCard.jsx    # Dashboard stat cards
│   │   ├── layout/
│   │   │   ├── Header.jsx      # App header
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── NavBar.jsx      # Navigation bar
│   │   │   ├── ProtectedRoute.jsx  # Route protection
│   │   │   └── Sidebar.jsx     # Sidebar navigation
│   │   └── ui/                 # shadcn/ui components
│   │       ├── alert.jsx
│   │       ├── avatar.jsx
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── loading.jsx
│   │       ├── page-transition.jsx
│   │       ├── progress.jsx
│   │       ├── scroll-area.jsx
│   │       ├── select.jsx
│   │       ├── separator.jsx
│   │       ├── switch.jsx
│   │       ├── table.jsx
│   │       ├── tabs.jsx
│   │       ├── textarea.jsx
│   │       └── tooltip.jsx
│   ├── lib/
│   │   ├── animations.js       # Framer Motion variants
│   │   └── utils.js            # Utility functions
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── DashboardHome.jsx        # Dashboard overview
│   │   │   ├── Trucks.jsx               # Trucks list
│   │   │   ├── TruckForm.jsx            # Add/Edit truck
│   │   │   ├── Trailers.jsx             # Trailers list
│   │   │   ├── TrailerForm.jsx          # Add/Edit trailer
│   │   │   ├── Tires.jsx                # Tires list
│   │   │   ├── TireForm.jsx             # Add/Edit tire
│   │   │   ├── Trips.jsx                # Trips list
│   │   │   ├── TripForm.jsx             # Add/Edit trip
│   │   │   ├── Fuel.jsx                 # Fuel records list
│   │   │   ├── FuelForm.jsx             # Add/Edit fuel record
│   │   │   ├── Maintenance.jsx          # Maintenance records list
│   │   │   ├── MaintenanceForm.jsx      # Add/Edit maintenance
│   │   │   ├── MaintenanceRules.jsx     # Maintenance rules list
│   │   │   ├── MaintenanceRuleForm.jsx  # Add/Edit rule
│   │   │   ├── Drivers.jsx              # Drivers list
│   │   │   ├── DriverForm.jsx           # Add/Edit driver
│   │   │   ├── Reports.jsx              # Reports page
│   │   │   └── UserProfile.jsx          # User profile
│   │   ├── Dashboard.jsx        # Dashboard layout
│   │   ├── Home.jsx             # Landing page
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── NotFound.jsx         # 404 page
│   │   └── Unauthorized.jsx     # 403 page
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js            # Auth state
│   │   │   ├── truckSlice.js           # Trucks state
│   │   │   ├── trailerSlice.js         # Trailers state
│   │   │   ├── tireSlice.js            # Tires state
│   │   │   ├── tripSlice.js            # Trips state
│   │   │   ├── fuelSlice.js            # Fuel records state
│   │   │   ├── maintenanceSlice.js     # Maintenance state
│   │   │   ├── maintenanceRuleSlice.js # Maintenance rules state
│   │   │   └── userSlice.js            # User state
│   │   └── store.js             # Redux store configuration
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles
├── components.json              # shadcn/ui config
├── eslint.config.js            # ESLint configuration
├── jsconfig.json               # JavaScript config
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # TailwindCSS config
├── Dockerfile                  # Docker configuration
└── package.json
```

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## Authentication

The app uses JWT tokens stored in localStorage:
- Token is automatically attached to API requests via Axios interceptors
- Protected routes redirect to login if not authenticated
- Role-based access control (admin vs driver)

## User Roles

### Admin
- Full access to all features
- Can manage: trucks, trailers, tires, trips, fuel, maintenance, rules, drivers
- Can view reports and analytics

### Driver
- Limited access
- Can view assigned trips
- Can update trip status
- Can add fuel records for their trips
- Can view their profile

## Theming

The app uses a custom dark theme with brand colors:

```css
--brand-orange: #FF6B35
--brand-black: #0A0E27
--brand-dark: #151A33
--brand-navy: #1E2749
--brand-grey: #E8E9F3
--brand-muted: #6B7280
```

Colors are defined in `index.css` and used throughout with TailwindCSS.

## Animations

The app uses Framer Motion for smooth animations:
- Page transitions
- List animations
- Modal animations
- Loading states

Animation variants are centralized in `lib/animations.js`.

## Responsive Design

The app is fully responsive:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

TailwindCSS breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

## Docker

### Build Image
```bash
docker build -t routexpert-frontend .
```

### Run Container
```bash
docker run -p 3000:80 \
  -e VITE_API_URL=http://localhost:5000/api \
  routexpert-frontend
```

### Docker Compose (Recommended)
```bash
# From project root
docker-compose up frontend
```

## State Management

### Redux Toolkit Slices

Each feature has its own slice with:
- Initial state
- Async thunks for API calls
- Reducers for state updates
- Selectors for data access

Example usage:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { getTrucks } from '@/store/slices/truckSlice';

function TrucksPage() {
  const dispatch = useDispatch();
  const { trucks, isLoading } = useSelector((state) => state.trucks);

  useEffect(() => {
    dispatch(getTrucks());
  }, [dispatch]);

  // ...
}
```

## Performance Optimization

- Code splitting with React.lazy
- Memoization with useMemo and useCallback
- Optimized re-renders with Redux Toolkit
- Image lazy loading
- Debounced search inputs
- Pagination for large lists

## Best Practices

- Use custom hooks for reusable logic
- Keep components small and focused
- Use TypeScript for better type safety (future enhancement)
- Follow the Airbnb React style guide
- Write semantic HTML
- Ensure accessibility (ARIA labels, keyboard navigation)

## Environment-Specific Builds

### Development
```bash
VITE_API_URL=http://localhost:5000/api npm run dev
```

### Staging
```bash
VITE_API_URL=https://staging-api.yourdomain.com/api npm run build
```

### Production
```bash
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

## Debugging

### Redux DevTools
Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) to inspect state and actions.

### React DevTools
Install [React DevTools](https://react.dev/learn/react-developer-tools) to inspect component hierarchy and props.

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
