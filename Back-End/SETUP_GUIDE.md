# Clinic Backend - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- express, cors
- sequelize, mysql2
- jsonwebtoken, bcryptjs
- nodemailer
- express-validator
- dotenv

### 2. Database Setup

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE clinic_db;
   ```

2. **Update `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=clinic_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

### 3. Environment Configuration

Update `.env` with all required values:

```env
# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Note for Gmail:** You'll need to use an "App Password" instead of your regular password. Enable 2FA and generate an app password in your Google Account settings.

### 4. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will:
- Connect to the database
- Sync models (create tables in development)
- Start on port 3000 (or PORT from .env)

### 5. Verify Setup

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Clinic Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Initial Data Setup

### Create Admin User

You can create an admin user via API:

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "FirstName": "Admin",
  "LastName": "User",
  "Email": "admin@clinic.com",
  "Password": "admin123",
  "Role": "Admin"
}
```

**Note:** You may need to manually update the role in the database if registration doesn't allow Admin role by default.

### Create Specialties

```bash
POST http://localhost:3000/api/admin/specialties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "Name": "Cardiology",
  "Description": "Heart and cardiovascular system"
}
```

### Create Doctor

```bash
POST http://localhost:3000/api/admin/doctors
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "FirstName": "John",
  "LastName": "Doe",
  "Email": "doctor@clinic.com",
  "Password": "doctor123",
  "Phone": "1234567890",
  "SpecialtyID": 1,
  "Bio": "Experienced cardiologist"
}
```

### Set Doctor Working Hours

```bash
POST http://localhost:3000/api/admin/doctors/2/working-hours
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "workingHours": [
    {
      "DayOfWeek": 1,
      "StartTime": "09:00",
      "EndTime": "17:00"
    },
    {
      "DayOfWeek": 2,
      "StartTime": "09:00",
      "EndTime": "17:00"
    },
    {
      "DayOfWeek": 3,
      "StartTime": "09:00",
      "EndTime": "17:00"
    },
    {
      "DayOfWeek": 4,
      "StartTime": "09:00",
      "EndTime": "17:00"
    },
    {
      "DayOfWeek": 5,
      "StartTime": "09:00",
      "EndTime": "17:00"
    }
  ]
}
```

**DayOfWeek values:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

## Testing the API

### 1. Register a Patient

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "FirstName": "Jane",
  "LastName": "Smith",
  "Email": "patient@example.com",
  "Password": "patient123",
  "Phone": "0987654321"
}
```

### 2. Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "Email": "patient@example.com",
  "Password": "patient123"
}
```

Save the `token` from the response.

### 3. Book an Appointment

```bash
POST http://localhost:3000/api/appointments
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "DoctorID": 2,
  "AppointmentDate": "2024-01-15",
  "StartTime": "10:00",
  "EndTime": "10:30",
  "Notes": "Regular checkup"
}
```

### 4. Get Appointments

```bash
GET http://localhost:3000/api/appointments
Authorization: Bearer <patient_token>
```

## Common Issues

### Database Connection Error

**Error:** `Unable to connect to the database`

**Solutions:**
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Ensure database exists: `CREATE DATABASE clinic_db;`
4. Check MySQL user permissions

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solutions:**
1. Change PORT in `.env`
2. Kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

### Email Not Sending

**Error:** Email notifications not working

**Solutions:**
1. Verify email credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check if 2FA is enabled
4. Verify SMTP settings

### JWT Token Invalid

**Error:** `Invalid token`

**Solutions:**
1. Ensure token is included in header: `Authorization: Bearer <token>`
2. Check if token has expired
3. Verify JWT_SECRET in `.env` matches

## Production Deployment

1. **Set NODE_ENV to production:**
   ```env
   NODE_ENV=production
   ```

2. **Use strong JWT secret:**
   ```env
   JWT_SECRET=<generate-strong-random-string>
   ```

3. **Use database migrations instead of sync:**
   - Install sequelize-cli: `npm install -g sequelize-cli`
   - Create migrations instead of using `sync()`

4. **Set up proper logging:**
   - Use winston or similar logging library
   - Log errors and important events

5. **Enable HTTPS:**
   - Use reverse proxy (nginx) with SSL
   - Or use Express with SSL certificates

6. **Set up monitoring:**
   - Health check endpoints
   - Error tracking (Sentry, etc.)
   - Performance monitoring

## Next Steps

1. ✅ Database setup complete
2. ✅ API endpoints working
3. ⏭️ Frontend integration
4. ⏭️ Add appointment reminder scheduler
5. ⏭️ Implement SMS notifications
6. ⏭️ Add file upload for documents
7. ⏭️ Set up automated testing

## Support

For issues or questions, refer to:
- `README.md` - Main documentation
- `PROJECT_STRUCTURE.md` - Code structure details
- API endpoint documentation in controllers

