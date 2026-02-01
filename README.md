# RouteXpert
Truck fleet trip, fuel and maintenance tracking application

// [![Backend CI/CD](https://github.com/YassineElHassani/RouteXpert/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/YassineElHassani/RouteXpert/actions/workflows/backend-ci.yml)
// [![Frontend CI/CD](https://github.com/YassineElHassani/RouteXpert/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/YassineElHassani/RouteXpert/actions/workflows/frontend-ci.yml)
// [![Full Stack CI](https://github.com/YassineElHassani/RouteXpert/actions/workflows/ci.yml/badge.svg)](https://github.com/YassineElHassani/RouteXpert/actions/workflows/ci.yml)

## Features

- **Fleet Management**: Track trucks, trailers, and tires
- **Trip Management**: Monitor trips, routes, and driver assignments
- **Fuel Tracking**: Record and analyze fuel consumption
- **Maintenance System**: Schedule and track maintenance with configurable rules
- **Role-Based Access**: Admin and driver roles with different permissions
- **Real-time Dashboard**: Monitor fleet status and analytics
- **Automated Reports**: Generate PDF reports for trips and maintenance

## Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB 7.0
- **Authentication**: JWT
- **Testing**: Jest
- **PDF Generation**: PDFKit

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier

## Prerequisites

- **Node.js**: v20 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **MongoDB**: v7.0 (or use Docker)
- **npm**: v9 or higher

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YassineElHassani/RouteXpert.git
   cd RouteXpert
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/routexpert
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
EOF

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

## Testing

### Backend Tests
```bash
cd backend
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

### Frontend Build
```bash
cd frontend
npm run lint            # Lint code
npm run build          # Production build
npm run preview        # Preview build
```

## Docker Commands

```bash
# Build and start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend

# Remove volumes (clean slate)
docker-compose down -v
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Trucks
- `GET /api/trucks` - Get all trucks
- `POST /api/trucks` - Create truck
- `GET /api/trucks/:id` - Get truck by ID
- `PUT /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Maintenance Rules
- `GET /api/maintenance-rules` - Get all rules
- `POST /api/maintenance-rules` - Create rule
- `PUT /api/maintenance-rules/:id` - Update rule
- `DELETE /api/maintenance-rules/:id` - Delete rule
- `GET /api/maintenance-rules/dashboard` - Get maintenance dashboard

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `PATCH /api/trips/:id/status` - Update trip status

*Full API documentation coming soon...*

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/routexpert
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment:

- **Backend CI**: Runs tests, builds Docker image
- **Frontend CI**: Lints code, builds application
- **Full Stack CI**: Integration tests with Docker Compose

See [CI/CD Documentation](.github/workflows/README.md) for details.

### Required GitHub Secrets
```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub token
DEPLOY_HOST             # Production server (optional)
DEPLOY_USER             # SSH user (optional)
DEPLOY_KEY              # SSH private key (optional)
```

## Project Structure

```
RouteXpert/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── tests/          # Jest tests
│   │   └── utils/          # Helpers & utilities
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   └── lib/            # Utilities
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/          # CI/CD pipelines
├── docker-compose.yml
└── README.md
```

## 👤 Author

**Yassine El Hassani**

- GitHub: [@YassineElHassani](https://github.com/YassineElHassani)

---

**Note**: Make sure to update the `.env` files with your actual configuration before deploying to production. Never commit sensitive credentials to version control.
