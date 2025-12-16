# RouteXpert Backend API

Node.js/Express backend API for the RouteXpert fleet management system.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest with Supertest
- **PDF Generation**: PDFKit
- **Validation**: Mongoose validation

## Prerequisites

- Node.js v20 or higher
- MongoDB v7.0 or higher (or Docker)
- npm v9 or higher

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/routexpert
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database (Optional)
```bash
npm run seed
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── truckController.js   # Truck management
│   │   ├── trailerController.js # Trailer management
│   │   ├── tireController.js    # Tire tracking
│   │   ├── tripController.js    # Trip management
│   │   ├── fuelController.js    # Fuel records
│   │   ├── maintenanceController.js        # Maintenance records
│   │   └── maintenanceRuleController.js    # Maintenance rules
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Truck.js             # Truck schema
│   │   ├── Trailer.js           # Trailer schema
│   │   ├── Tire.js              # Tire schema
│   │   ├── Trip.js              # Trip schema
│   │   ├── FuelRecord.js        # Fuel record schema
│   │   ├── MaintenanceRecord.js # Maintenance record schema
│   │   └── MaintenanceRule.js   # Maintenance rule schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── truckRoutes.js       # Truck endpoints
│   │   ├── trailerRoutes.js     # Trailer endpoints
│   │   ├── tireRoutes.js        # Tire endpoints
│   │   ├── tripRoutes.js        # Trip endpoints
│   │   ├── fuelRoutes.js        # Fuel endpoints
│   │   ├── maintenanceRoutes.js      # Maintenance endpoints
│   │   └── maintenanceRuleRoutes.js  # Maintenance rule endpoints
│   ├── tests/
│   │   ├── setup.js             # Test configuration
│   │   ├── auth.test.js         # Auth tests
│   │   ├── truck.test.js        # Truck tests
│   │   ├── trailer.test.js      # Trailer tests
│   │   ├── tire.test.js         # Tire tests
│   │   ├── trip.test.js         # Trip tests
│   │   ├── fuel.test.js         # Fuel tests
│   │   └── maintenance.test.js  # Maintenance tests
│   ├── utils/
│   │   ├── pdfGenerator.js      # PDF report generation
│   │   └── seeder.js            # Database seeder
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── coverage/                     # Test coverage reports
├── pdfs/                        # Generated PDF files
├── Dockerfile                   # Docker configuration
├── jest.config.js              # Jest configuration
└── package.json
```

## API Endpoints

### Authentication
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
GET    /api/auth/me           # Get current user
```

### Trucks
```
GET    /api/trucks            # Get all trucks
POST   /api/trucks            # Create truck (admin)
GET    /api/trucks/:id        # Get truck by ID
PUT    /api/trucks/:id        # Update truck (admin)
DELETE /api/trucks/:id        # Delete truck (admin)
GET    /api/trucks/:id/upcoming-maintenance  # Get upcoming maintenance
```

### Trailers
```
GET    /api/trailers          # Get all trailers
POST   /api/trailers          # Create trailer (admin)
GET    /api/trailers/:id      # Get trailer by ID
PUT    /api/trailers/:id      # Update trailer (admin)
DELETE /api/trailers/:id      # Delete trailer (admin)
```

### Tires
```
GET    /api/tires             # Get all tires
POST   /api/tires             # Create tire (admin)
GET    /api/tires/:id         # Get tire by ID
PUT    /api/tires/:id         # Update tire (admin)
DELETE /api/tires/:id         # Delete tire (admin)
```

### Trips
```
GET    /api/trips             # Get all trips
POST   /api/trips             # Create trip (admin)
GET    /api/trips/:id         # Get trip by ID
PUT    /api/trips/:id         # Update trip (admin)
PATCH  /api/trips/:id/status  # Update trip status (driver)
DELETE /api/trips/:id         # Delete trip (admin)
```

### Fuel Records
```
GET    /api/fuel              # Get all fuel records
POST   /api/fuel              # Create fuel record
GET    /api/fuel/:id          # Get fuel record by ID
PUT    /api/fuel/:id          # Update fuel record (admin)
DELETE /api/fuel/:id          # Delete fuel record (admin)
```

### Maintenance Records
```
GET    /api/maintenance       # Get all maintenance records
POST   /api/maintenance       # Create maintenance record (admin)
GET    /api/maintenance/:id   # Get maintenance record by ID
PUT    /api/maintenance/:id   # Update maintenance record (admin)
PATCH  /api/maintenance/:id/complete  # Mark as completed (admin)
DELETE /api/maintenance/:id   # Delete maintenance record (admin)
GET    /api/maintenance/alerts/pending   # Get pending maintenance
GET    /api/maintenance/alerts/overdue   # Get overdue maintenance
```

### Maintenance Rules
```
GET    /api/maintenance-rules           # Get all rules
POST   /api/maintenance-rules           # Create rule (admin)
GET    /api/maintenance-rules/:id       # Get rule by ID
PUT    /api/maintenance-rules/:id       # Update rule (admin)
DELETE /api/maintenance-rules/:id       # Delete rule (admin)
GET    /api/maintenance-rules/dashboard # Get maintenance dashboard (admin)
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Protected Routes
Add the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access
- **Admin**: Full access to all endpoints
- **Driver**: Limited access (view trips, update trip status, add fuel records)

## Docker

### Build Image
```bash
docker build -t routexpert-backend .
```

### Run Container
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/routexpert \
  -e JWT_SECRET=your_secret \
  routexpert-backend
```

### Docker Compose (Recommended)
```bash
# From project root
docker-compose up backend
```

## Database Models

### User
- username, email, password (hashed)
- role: 'admin' | 'driver'
- timestamps

### Truck
- plateNumber, brand, model, year
- mileage, fuelCapacity, fuelType
- status: 'active' | 'inactive' | 'maintenance'

### Trailer
- plateNumber, type, capacity
- mileage, status

### Tire
- position, brand, size, pressure
- truckId/trailerId reference
- status: 'good' | 'worn' | 'needs_replacement'

### Trip
- origin, destination, distance
- truckId, trailerId, driverId references
- startDate, endDate, status
- fuelConsumed, cost

### FuelRecord
- tripId reference
- quantity, pricePerLiter, cost
- fuelType, station, date

### MaintenanceRecord
- truckId/trailerId reference
- type, description, cost
- scheduledDate, completedDate
- status: 'pending' | 'scheduled' | 'completed'

### MaintenanceRule
- name, category, description
- intervalType: 'mileage' | 'time' | 'both'
- intervalMileage, intervalDays
- priority, estimatedCost, isActive

## Testing Best Practices

- All tests use an in-memory MongoDB database
- Tests are isolated and don't affect production data
- Use `beforeEach` and `afterEach` for setup/cleanup
- Test both success and error cases
- Aim for >80% code coverage

## Error Handling

The API uses a centralized error handler that returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
