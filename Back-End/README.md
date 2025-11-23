# Clinic Backend System

A comprehensive Node.js backend system for managing clinic appointments, patient records, doctor schedules, and medical records.

## Features

- **User Management**: Registration and authentication for Patients, Doctors, and Admins
- **Appointment System**: Book, cancel, reschedule appointments with conflict prevention
- **Patient Records**: Complete medical history, prescriptions, and lab results
- **Doctor Management**: Doctor profiles, specialties, and working hours
- **Notifications**: Email notifications for appointments and prescriptions
- **Admin Panel**: Manage users, generate reports, and system configuration
- **Role-Based Access Control**: Secure API with role-based permissions

## Tech Stack

- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications
- **express-validator** for input validation

## Project Structure

```
Back-End/
├── config/              # Configuration files
│   ├── config.js        # App configuration
│   └── database.js      # Database connection
├── controllers/         # Request handlers
│   ├── adminController.js
│   ├── appointmentController.js
│   ├── authController.js
│   ├── doctorController.js
│   ├── labResultController.js
│   ├── medicalRecordController.js
│   └── patientController.js
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── errorHandler.js  # Error handling
│   └── validator.js      # Input validation
├── models/              # Sequelize models
│   ├── Appointment.js
│   ├── Doctor.js
│   ├── DoctorWorkingHours.js
│   ├── LabResult.js
│   ├── MedicalRecord.js
│   ├── Patient.js
│   ├── Specialty.js
│   ├── User.js
│   └── index.js         # Model associations
├── routes/              # API routes
│  ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── patientRoutes.js
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── medicalRecordRoutes.js
│   ├── doctorWorkingHoursRoutes.js
├── services/            # Business logic services
│   ├── appointmentService.js
│   └── notificationService.js
├── utils/               # Utility functions
│   ├── jwtUtils.js
│   └── passwordUtils.js
├── app.js               # Express app setup
├── server.js            # Server entry point
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Back-End
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - Database credentials
   - JWT secret
   - Email service credentials

4. **Create MySQL database**
   ```sql
   CREATE DATABASE clinic_db;
   ```

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Appointments
- `POST /api/appointments` - Book appointment (Patient)
- `GET /api/appointments` - Get appointments (filtered by role)
- `GET /api/appointments/:id` - Get single appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Patients
- `GET /api/patients/:id` - Get patient profile
- `PUT /api/patients/:id` - Update patient profile
- `GET /api/patients/:id/medical-records` - Get patient medical records

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get single doctor
- `GET /api/doctors/:id/availability` - Get available time slots
- `GET /api/doctors/:id/appointments` - Get doctor's appointments (Doctor only)
- `PUT /api/doctors/profile` - Update doctor profile (Doctor only)

### Medical Records
- `POST /api/medical-records` - Create medical record (Doctor only)
- `GET /api/medical-records/:id` - Get medical record
- `PUT /api/medical-records/:id` - Update medical record (Doctor only)

### Lab Results
- `POST /api/lab-results` - Create lab result (Doctor/Admin)
- `GET /api/lab-results/record/:recordId` - Get lab results for a record
- `GET /api/lab-results/:id` - Get single lab result
- `PUT /api/lab-results/:id` - Update lab result (Doctor/Admin)
- `DELETE /api/lab-results/:id` - Delete lab result (Doctor/Admin)

### Admin
- `POST /api/admin/doctors` - Create doctor
- `PUT /api/admin/doctors/:id` - Update doctor
- `DELETE /api/admin/doctors/:id` - Delete doctor
- `GET /api/admin/patients` - Get all patients
- `PUT /api/admin/patients/:id` - Update patient
- `GET /api/admin/specialties` - Get all specialties
- `POST /api/admin/specialties` - Create specialty
- `PUT /api/admin/specialties/:id` - Update specialty
- `DELETE /api/admin/specialties/:id` - Delete specialty
- `POST /api/admin/doctors/:doctorId/working-hours` - Set doctor working hours
- `GET /api/admin/reports/daily-schedule` - Get daily schedule
- `GET /api/admin/reports/weekly-summary` - Get weekly summary
- `GET /api/admin/reports/doctor-workload` - Get doctor workload statistics
# API Routes Guide

## Auth

POST /auth/register
```json
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "password": "",
  "role": "patient | doctor"
}
POST /auth/login

json
Copy code
{
  "email": "",
  "password": ""
}
Users
GET /users/:id

```json
{
  "userId": 1,
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "role": ""
}
PUT /users/:id

```json
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": ""
}
Patients
GET /patients/:id

```json
{
  "patientId": 1,
  "dateOfBirth": "",
  "gender": "",
  "address": "",
  "bloodType": "",
  "chronicDisease": ""
}
PUT /patients/:id

```json
{
  "address": "",
  "bloodType": "",
  "chronicDisease": ""
}
Doctors
GET /doctors

```json
[
  {
    "doctorId": 1,
    "specialtyId": 3,
    "bio": ""
  }
]
GET /doctors/:id

```json
{
  "doctorId": 1,
  "specialtyId": 3,
  "bio": "",
  "workingHours": [
    {
      "dayOfWeek": "",
      "startTime": "",
      "endTime": ""
    }
  ]
}
Appointments
POST /appointments

```json
{
  "doctorId": 1,
  "patientId": 1,
  "appointmentDate": "",
  "startTime": ""
}
GET /appointments?patientId=

```json
[
  {
    "appointmentId": 1,
    "appointmentDate": "",
    "startTime": "",
    "endTime": "",
    "status": "",
    "doctorId": 1
  }
]
PUT /appointments/:id/cancel

```json
{
  "appointmentId": 1,
  "status": "canceled"
}
Medical Records
GET /medical-records/patient/:patientId

```json
[
  {
    "recordId": 1,
    "appointmentId": 1,
    "diagnosis": "",
    "notes": "",
    "prescription": ""
  }
]
POST /medical-records

```json
{
  "appointmentId": 1,
  "doctorId": 1,
  "patientId": 1,
  "diagnosis": "",
  "notes": "",
  "prescription": ""
}
Doctor Working Hours
GET /working-hours/doctor/:doctorId

```json
[
  {
    "workingHourId": 1,
    "dayOfWeek": "",
    "startTime": "",
    "endTime": ""
  }
]
POST /working-hours

```json
{
  "doctorId": 1,
  "dayOfWeek": "",
  "startTime": "",
  "endTime": ""
}

## Business Rules Implementation

### User Roles & Access Control
- Three roles: Patient, Doctor, Admin
- JWT-based authentication required for protected routes
- Role-based authorization middleware

### Appointment Booking Rules
- One appointment per patient per doctor per time slot
- Automatic conflict detection (overlapping appointments)
- Working hours validation
- Past appointment cancellation prevention

### Medical Records Rules
- Only assigned doctors can create/update records
- Patients can view but not modify records
- All records timestamped

### Notification Rules
- Email notifications for:
  - Appointment confirmation
  - Appointment cancellation
  - Appointment reminders (to be implemented)
  - Prescription updates

## Database Schema

The system uses the following main entities:
- **Users**: Base user table (Patients, Doctors, Admins)
- **Patients**: Patient-specific information
- **Doctors**: Doctor-specific information
- **Specialties**: Medical specialties
- **DoctorWorkingHours**: Weekly availability
- **Appointments**: Appointment bookings
- **MedicalRecords**: Consultation records
- **LabResults**: Lab test results

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation with express-validator
- SQL injection protection (Sequelize ORM)
- Error handling without exposing sensitive information

## Development

### Adding New Features

1. Create model in `models/` if needed
2. Add associations in `models/index.js`
3. Create controller in `controllers/`
4. Add routes in `routes/`
5. Register routes in `app.js`
6. Add validation rules in `middleware/validator.js`

### Database Migrations

For production, use Sequelize migrations instead of `sync()`:
```bash
npx sequelize-cli init:migrations
npx sequelize-cli migration:generate --name create-users
```

## Testing

Health check endpoint:
```bash
GET http://localhost:3000/health
```

## Future Enhancements

- SMS notifications
- Appointment reminder scheduler
- Online payment integration
- Telemedicine support
- File upload for lab results
- Advanced search and filtering
- Real-time notifications (WebSocket)

## License

ISC

## Authors

Ali Fathy & Huda Ali

