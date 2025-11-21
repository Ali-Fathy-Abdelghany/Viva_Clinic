# Clinic Backend - Project Structure

## Complete Folder Structure

```
Back-End/
│
├── config/                          # Configuration files
│   ├── config.js                    # Application configuration (JWT, Email, etc.)
│   └── database.js                  # Sequelize database connection
│
├── controllers/                     # Request handlers (Business logic)
│   ├── adminController.js          # Admin operations (doctors, patients, reports)
│   ├── appointmentController.js    # Appointment CRUD operations
│   ├── authController.js           # Authentication (register, login, profile)
│   ├── doctorController.js         # Doctor operations
│   ├── labResultController.js      # Lab result operations
│   ├── medicalRecordController.js  # Medical record operations
│   └── patientController.js        # Patient operations
│
├── middleware/                      # Custom middleware functions
│   ├── auth.js                     # JWT authentication & role authorization
│   ├── errorHandler.js             # Global error handling & custom errors
│   └── validator.js                # Input validation rules (express-validator)
│
├── models/                          # Sequelize ORM models
│   ├── Appointment.js              # Appointment model
│   ├── Doctor.js                   # Doctor model
│   ├── DoctorWorkingHours.js      # Doctor working hours model
│   ├── LabResult.js                # Lab result model
│   ├── MedicalRecord.js            # Medical record model
│   ├── Patient.js                  # Patient model
│   ├── Specialty.js                # Specialty model
│   ├── User.js                     # User model (base for all roles)
│   └── index.js                    # Model associations & exports
│
├── routes/                          # API route definitions
│   ├── adminRoutes.js              # Admin routes (/api/admin/*)
│   ├── appointmentRoutes.js        # Appointment routes (/api/appointments/*)
│   ├── authRoutes.js               # Auth routes (/api/auth/*)
│   ├── doctorRoutes.js             # Doctor routes (/api/doctors/*)
│   ├── labResultRoutes.js          # Lab result routes (/api/lab-results/*)
│   ├── medicalRecordRoutes.js      # Medical record routes (/api/medical-records/*)
│   └── patientRoutes.js            # Patient routes (/api/patients/*)
│
├── services/                        # Business logic services
│   ├── appointmentService.js       # Appointment validation & availability logic
│   └── notificationService.js      # Email/SMS notification service
│
├── utils/                           # Utility functions
│   ├── jwtUtils.js                 # JWT token generation & verification
│   └── passwordUtils.js            # Password hashing & comparison
│
├── app.js                           # Express application setup
├── server.js                        # Server entry point & database connection
├── package.json                     # Dependencies & scripts
├── .env.example                     # Environment variables template
├── README.md                        # Project documentation
└── PROJECT_STRUCTURE.md             # This file
```

## File Responsibilities

### Configuration (`config/`)
- **config.js**: Centralized configuration from environment variables
- **database.js**: Sequelize instance and database connection setup

### Models (`models/`)
- Define database schema using Sequelize
- Set up relationships between entities
- **index.js**: Exports all models and defines associations

### Controllers (`controllers/`)
- Handle HTTP requests and responses
- Call services for business logic
- Return JSON responses
- Use `asyncHandler` for error handling

### Middleware (`middleware/`)
- **auth.js**: 
  - `authenticate`: Verify JWT tokens
  - `authorize`: Check user roles
  - `authorizeResource`: Check resource ownership
- **errorHandler.js**: 
  - `AppError`: Custom error class
  - `errorHandler`: Global error handler
  - `asyncHandler`: Wrapper for async functions
- **validator.js**: Input validation rules using express-validator

### Routes (`routes/`)
- Define API endpoints
- Apply middleware (auth, validation)
- Map routes to controllers

### Services (`services/`)
- Complex business logic
- Reusable functions
- Appointment conflict checking
- Notification sending

### Utils (`utils/`)
- Helper functions
- Password hashing
- JWT operations

## API Route Structure

```
/api/auth/*              - Authentication endpoints
/api/appointments/*      - Appointment management
/api/patients/*         - Patient operations
/api/doctors/*          - Doctor operations
/api/medical-records/*  - Medical record management
/api/lab-results/*      - Lab result management
/api/admin/*            - Admin operations (requires Admin role)
```

## Authentication Flow

1. User registers/logs in → `authController`
2. JWT token generated → `jwtUtils`
3. Token sent to client
4. Client includes token in `Authorization: Bearer <token>` header
5. `authenticate` middleware verifies token
6. `authorize` middleware checks role permissions
7. Controller handles request

## Error Handling Flow

1. Controller uses `asyncHandler` wrapper
2. Errors thrown as `AppError` instances
3. `errorHandler` middleware catches all errors
4. Returns appropriate HTTP status and JSON response
5. Development mode includes stack traces

## Database Flow

1. Models define schema
2. `models/index.js` sets up associations
3. `server.js` syncs models (development) or uses migrations (production)
4. Controllers use models for database operations

## Key Features by File

### Appointment System
- **appointmentService.js**: Conflict detection, availability checking
- **appointmentController.js**: Booking, cancellation, rescheduling
- **notificationService.js**: Confirmation emails

### Medical Records
- **medicalRecordController.js**: Create/update records (Doctor only)
- **labResultController.js**: Lab result management
- Linked to appointments via foreign keys

### Admin Features
- **adminController.js**: 
  - Doctor/Patient management
  - Specialty management
  - Working hours configuration
  - Report generation

## Security Features

- Password hashing (bcryptjs)
- JWT authentication
- Role-based access control
- Input validation
- SQL injection protection (Sequelize)
- Error message sanitization

## Next Steps for Development

1. Install dependencies: `npm install`
2. Set up `.env` file from `.env.example`
3. Create MySQL database
4. Run server: `npm run dev`
5. Test endpoints using Postman/Thunder Client
6. Implement additional features as needed

