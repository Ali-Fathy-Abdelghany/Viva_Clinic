-- 1. Users Table
CREATE TABLE users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Role ENUM('Patient', 'Doctor', 'Admin') NOT NULL
);

-- 2. Specialties Table
CREATE TABLE specialties (
    SpecialtyID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT
);

-- 3. Patients Table
CREATE TABLE patients (
    PatientID INT PRIMARY KEY,
    DateOfBirth DATE,
    Gender ENUM('M','F'),
    Address VARCHAR(255),
    Image_url VARCHAR(255),
    BloodType ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    FOREIGN KEY (PatientID) REFERENCES users(UserID) ON DELETE CASCADE
);

-- 4. Doctors Table
CREATE TABLE doctors (
    DoctorID INT PRIMARY KEY,
    SpecialtyID INT,
    Bio TEXT,
    Image_url VARCHAR(255),
    Gender ENUM('M', 'F'),
    Fee INT,
    Education TEXT,
    YearsOfExperience INT,
    FOREIGN KEY (DoctorID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (SpecialtyID) REFERENCES specialties(SpecialtyID) ON DELETE SET NULL
);

-- 5. Award Table
CREATE TABLE award (
    DoctorID INT NOT NULL,
    Award_name TEXT,
    Award_description TEXT,
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID) ON DELETE CASCADE
);

-- 6. Certifications Table
CREATE TABLE certifications (
    DoctorID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID) ON DELETE CASCADE
);

-- 7. Doctor Working Hours Table
-- ADDED UNIQUE CONSTRAINT to prevent overlapping start times for the same doctor on the same day
CREATE TABLE doctorworkinghours (
    WorkingHourID INT AUTO_INCREMENT PRIMARY KEY,
    DoctorID INT NOT NULL,
    DayOfWeek ENUM('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday') NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    UNIQUE KEY unique_slot (DoctorID, DayOfWeek, StartTime),
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID) ON DELETE CASCADE
);

-- 8. Appointments Table
-- ADDED UNIQUE CONSTRAINT to prevent double-booking a doctor
CREATE TABLE appointments (
    AppointmentID INT AUTO_INCREMENT PRIMARY KEY,
    PatientID INT NOT NULL,
    DoctorID INT NOT NULL,
    AppointmentDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status ENUM('Booked', 'Cancelled', 'Rescheduled', 'Completed') DEFAULT 'Rescheduled',
    UNIQUE KEY unique_booking (DoctorID, AppointmentDate, StartTime),
    FOREIGN KEY (PatientID) REFERENCES patients(PatientID) ON DELETE CASCADE,
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID) ON DELETE CASCADE
);

-- 9. Medical Records Table
CREATE TABLE medicalrecords (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    AppointmentID INT UNIQUE,
    PatientID INT NOT NULL,
    DoctorID INT NOT NULL,
    Diagnosis TEXT,
    Notes TEXT,
    Drug TEXT,
    FOREIGN KEY (AppointmentID) REFERENCES appointments(AppointmentID) ON DELETE CASCADE,
    FOREIGN KEY (PatientID) REFERENCES patients(PatientID) ON DELETE CASCADE,
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID) ON DELETE CASCADE
);

-- 10. Medical Info Table
CREATE TABLE medical_info (
    PatientID INT NOT NULL,
    InfoType ENUM('ChronicDisease', 'Allergy') NOT NULL,
    Name ENUM(
        'Diabetes',
        'Hypertension',
        'Asthma',
        'ChronicOther',
        'Medication',
        'Environmental',
        'Food',
        'AllergyOther'
    ) NOT NULL,

    CHECK (
        (InfoType = 'ChronicDisease' AND Name IN ('Diabetes', 'Hypertension', 'Asthma', 'ChronicOther'))
        OR
        (InfoType = 'Allergy' AND Name IN ('Medication', 'Environmental', 'Food', 'AllergyOther'))
    ),

    FOREIGN KEY (PatientID) REFERENCES patients(PatientID) ON DELETE CASCADE
);

-- ==========================================
-- DATA POPULATION
-- ==========================================

-- 1. Insert 5 Specialties
INSERT INTO specialties (Name, Description) VALUES 
('Cardiology', 'Heart and cardiovascular system'),
('Dermatology', 'Skin, hair, and nails'),
('Pediatrics', 'Medical care of infants and children'),
('Orthopedics', 'Musculoskeletal system'),
('Neurology', 'Nervous system disorders');

-- 2. Insert 10 Users (Doctors)
INSERT INTO users (FirstName, LastName, Email, PasswordHash, Phone, Role) VALUES 
('John', 'Doe', 'john.doe@hospital.com', 'hash123', '123-456-7890', 'Doctor'),     -- ID 1
('Jane', 'Smith', 'jane.smith@hospital.com', 'hash123', '123-456-7891', 'Doctor'), -- ID 2
('Robert', 'Brown', 'robert.brown@hospital.com', 'hash123', '123-456-7892', 'Doctor'), -- ID 3
('Emily', 'White', 'emily.white@hospital.com', 'hash123', '123-456-7893', 'Doctor'),   -- ID 4
('Michael', 'Green', 'michael.green@hospital.com', 'hash123', '123-456-7894', 'Doctor'), -- ID 5
('Sarah', 'Johnson', 'sarah.johnson@hospital.com', 'hash123', '123-456-7895', 'Doctor'), -- ID 6
('David', 'Lee', 'david.lee@hospital.com', 'hash123', '123-456-7896', 'Doctor'),       -- ID 7
('Lisa', 'Kim', 'lisa.kim@hospital.com', 'hash123', '123-456-7897', 'Doctor'),         -- ID 8
('James', 'Wilson', 'james.wilson@hospital.com', 'hash123', '123-456-7898', 'Doctor'),   -- ID 9
('Maria', 'Garcia', 'maria.garcia@hospital.com', 'hash123', '123-456-7899', 'Doctor');   -- ID 10

-- 3. Insert Doctors Details
INSERT INTO doctors (DoctorID, SpecialtyID, Bio, Image_url, Gender, Fee, Education, YearsOfExperience) VALUES 
-- Cardiology (SpecialtyID 1)
(1, 1, 'Experienced Cardiologist focusing on preventative care.', 'https://drive.google.com/file/d/1TiE5J-tF2P8HV05YBWXsZk1ET89SWyv4/view?usp=drive_link', 'M', 200, 'Harvard Medical School', 15),
(2, 1, 'Specialist in heart rhythm disorders.', 'https://drive.google.com/file/d/18g75zmf8hLet8NbQa-s0hU7wAgqN_da9/view?usp=drive_link', 'F', 220, 'Johns Hopkins', 12),

-- Dermatology (SpecialtyID 2)
(3, 2, 'Expert in cosmetic and medical dermatology.', 'https://drive.google.com/file/d/1UYD0fcF04G5sHnsribfZ9OJn3nK524Pq/view?usp=drive_link', 'M', 150, 'Stanford University', 10),
(4, 2, 'Focuses on pediatric dermatology.', 'https://drive.google.com/file/d/14Cdjn68AX6mKml4UEo8xr2Jow7T_iLwM/view?usp=drive_link', 'F', 160, 'Yale School of Medicine', 8),

-- Pediatrics (SpecialtyID 3)
(5, 3, 'General pediatrician with a love for kids.', 'https://drive.google.com/file/d/1dpwvz4tqix6P-orQAwriuUk_8xUg2gLm/view?usp=drive_link', 'M', 100, 'UCSF', 20),
(6, 3, 'Specialist in adolescent medicine.', 'https://drive.google.com/file/d/1fPqAkPDVNR8WTDlkYqTdooPiXQa6moMH/view?usp=drive_link', 'F', 110, 'UPenn', 14),

-- Orthopedics (SpecialtyID 4)
(7, 4, 'Orthopedic surgeon specializing in sports injuries.', 'https://drive.google.com/file/d/1H8SjBIAZStHepJ2SNMYs57c167aLcZyP/view?usp=drive_link', 'M', 250, 'Duke University', 18),
(8, 4, 'Expert in joint replacement surgery.', 'https://drive.google.com/file/d/1t_0L4_FnkRchbVBw9ZbkSoSfPJzrlnVi/view?usp=drive_link', 'F', 260, 'Columbia University', 16),

-- Neurology (SpecialtyID 5)
(9, 5, 'Neurologist focused on headache and pain management.', 'https://drive.google.com/file/d/1_wB-vG7jbQi9YznlSFrIngGttNRUpZze/view?usp=drive_link', 'M', 230, 'Mayo Clinic', 22),
(10, 5, 'Specialist in neurodegenerative diseases.', 'https://drive.google.com/file/d/1HY6elvZGXIqVGh57bWg9aBzKJa5Kxf8F/view?usp=drive_link', 'F', 240, 'Oxford University', 19);

-- 4. Insert Certifications (All Doctors)
INSERT INTO certifications (DoctorID, Title, Description) VALUES
(1, 'Board Certified Cardiologist', 'American Board of Internal Medicine'),
(1, 'Advanced Cardiac Life Support', 'AHA Certified'),
(2, 'Pediatric Cardiology Fellowship', 'Mayo Clinic'),
(2, 'Electrophysiology Certification', 'Heart Rhythm Society'),
(3, 'American Academy of Dermatology Fellow', 'FAAD'),
(3, 'Mohs Surgery Certification', 'American College of Mohs Surgery'),
(4, 'Pediatric Dermatology', 'Society for Pediatric Dermatology'),
(5, 'Board Certified Pediatrician', 'American Board of Pediatrics'),
(6, 'Adolescent Medicine Certification', 'American Board of Pediatrics'),
(7, 'Sports Medicine Certification', 'American Board of Orthopaedic Surgery'),
(8, 'Joint Replacement Fellowship', 'Hospital for Special Surgery'),
(9, 'Neurology Board Certification', 'American Board of Psychiatry and Neurology'),
(10, 'Neurocritical Care Certification', 'UCNS');

-- 5. Insert Awards (All Doctors)
INSERT INTO award (DoctorID, Award_name, Award_description) VALUES
(1, 'Top Cardiologist 2023', 'Recognized by Medical Association for excellence'),
(2, 'Excellence in Research', 'Awarded for arrhythmia research paper'),
(3, 'Best Dermatologist 2022', 'Voted by local community'),
(4, 'Compassionate Doctor Award', 'Based on patient reviews'),
(5, 'Community Hero Award', 'For volunteer work in underserved areas'),
(6, 'Rising Star in Pediatrics', 'Young Physician Award'),
(7, 'Sports Medicine Leader', 'For work with professional athletes'),
(8, 'Surgical Excellence Award', 'Lowest complication rate in region'),
(9, 'Brain Health Pioneer', 'Contribution to migraine studies'),
(10, 'Stroke Recovery Excellence', 'Best outcomes in stroke rehabilitation');

-- 6. Insert Doctor Working Hours
-- Enforcing strict 30-minute slots.
-- Example pattern: Mornings (9-12) or Afternoons (1-4)
INSERT INTO doctorworkinghours (DoctorID, DayOfWeek, StartTime, EndTime) VALUES
-- Doctor 1: Monday, Wednesday, Friday (9:00 - 10:30)
(1, 'Monday', '09:00:00', '09:30:00'), (1, 'Monday', '09:30:00', '10:00:00'), (1, 'Monday', '10:00:00', '10:30:00'),
(1, 'Wednesday', '09:00:00', '09:30:00'), (1, 'Wednesday', '09:30:00', '10:00:00'), (1, 'Wednesday', '10:00:00', '10:30:00'),
(1, 'Friday', '09:00:00', '09:30:00'), (1, 'Friday', '09:30:00', '10:00:00'), (1, 'Friday', '10:00:00', '10:30:00'),

-- Doctor 2: Tuesday, Thursday (13:00 - 14:30)
(2, 'Tuesday', '13:00:00', '13:30:00'), (2, 'Tuesday', '13:30:00', '14:00:00'), (2, 'Tuesday', '14:00:00', '14:30:00'),
(2, 'Thursday', '13:00:00', '13:30:00'), (2, 'Thursday', '13:30:00', '14:00:00'), (2, 'Thursday', '14:00:00', '14:30:00'),

-- Doctor 3: Monday, Saturday (08:30 - 10:00)
(3, 'Monday', '08:30:00', '09:00:00'), (3, 'Monday', '09:00:00', '09:30:00'), (3, 'Monday', '09:30:00', '10:00:00'),
(3, 'Saturday', '08:30:00', '09:00:00'), (3, 'Saturday', '09:00:00', '09:30:00'), (3, 'Saturday', '09:30:00', '10:00:00'),

-- Doctor 4: Sunday, Thursday (14:00 - 15:30)
(4, 'Sunday', '14:00:00', '14:30:00'), (4, 'Sunday', '14:30:00', '15:00:00'), (4, 'Sunday', '15:00:00', '15:30:00'),
(4, 'Thursday', '14:00:00', '14:30:00'), (4, 'Thursday', '14:30:00', '15:00:00'), (4, 'Thursday', '15:00:00', '15:30:00'),

-- Doctor 5: Monday, Friday (09:00 - 10:30)
(5, 'Monday', '09:00:00', '09:30:00'), (5, 'Monday', '09:30:00', '10:00:00'), (5, 'Monday', '10:00:00', '10:30:00'),
(5, 'Friday', '09:00:00', '09:30:00'), (5, 'Friday', '09:30:00', '10:00:00'), (5, 'Friday', '10:00:00', '10:30:00'),

-- Doctor 6: Wednesday, Saturday (11:00 - 12:30)
(6, 'Wednesday', '11:00:00', '11:30:00'), (6, 'Wednesday', '11:30:00', '12:00:00'), (6, 'Wednesday', '12:00:00', '12:30:00'),
(6, 'Saturday', '11:00:00', '11:30:00'), (6, 'Saturday', '11:30:00', '12:00:00'), (6, 'Saturday', '12:00:00', '12:30:00'),

-- Doctor 7: Tuesday, Thursday (13:30 - 15:00)
(7, 'Tuesday', '13:30:00', '14:00:00'), (7, 'Tuesday', '14:00:00', '14:30:00'), (7, 'Tuesday', '14:30:00', '15:00:00'),
(7, 'Thursday', '13:30:00', '14:00:00'), (7, 'Thursday', '14:00:00', '14:30:00'), (7, 'Thursday', '14:30:00', '15:00:00'),

-- Doctor 8: Monday, Wednesday (08:30 - 10:00)
(8, 'Monday', '08:30:00', '09:00:00'), (8, 'Monday', '09:00:00', '09:30:00'), (8, 'Monday', '09:30:00', '10:00:00'),
(8, 'Wednesday', '08:30:00', '09:00:00'), (8, 'Wednesday', '09:00:00', '09:30:00'), (8, 'Wednesday', '09:30:00', '10:00:00'),

-- Doctor 9: Sunday, Tuesday (15:00 - 16:30)
(9, 'Sunday', '15:00:00', '15:30:00'), (9, 'Sunday', '15:30:00', '16:00:00'), (9, 'Sunday', '16:00:00', '16:30:00'),
(9, 'Tuesday', '15:00:00', '15:30:00'), (9, 'Tuesday', '15:30:00', '16:00:00'), (9, 'Tuesday', '16:00:00', '16:30:00'),

-- Doctor 10: Wednesday, Friday (10:30 - 12:00)
(10, 'Wednesday', '10:30:00', '11:00:00'), (10, 'Wednesday', '11:00:00', '11:30:00'), (10, 'Wednesday', '11:30:00', '12:00:00'),
(10, 'Friday', '10:30:00', '11:00:00'), (10, 'Friday', '11:00:00', '11:30:00'), (10, 'Friday', '11:30:00', '12:00:00');

-- 7. Insert Users (30 Patients)
-- IDs 11 to 40
INSERT INTO users (FirstName, LastName, Email, PasswordHash, Phone, Role) VALUES
('Alice', 'Johnson', 'alice.j@email.com', 'hash123', '555-0101', 'Patient'),
('Bob', 'Williams', 'bob.w@email.com', 'hash123', '555-0102', 'Patient'),
('Charlie', 'Brown', 'charlie.b@email.com', 'hash123', '555-0103', 'Patient'),
('Diana', 'Miller', 'diana.m@email.com', 'hash123', '555-0104', 'Patient'),
('Evan', 'Davis', 'evan.d@email.com', 'hash123', '555-0105', 'Patient'),
('Fiona', 'Garcia', 'fiona.g@email.com', 'hash123', '555-0106', 'Patient'),
('George', 'Rodriguez', 'george.r@email.com', 'hash123', '555-0107', 'Patient'),
('Hannah', 'Wilson', 'hannah.w@email.com', 'hash123', '555-0108', 'Patient'),
('Ian', 'Martinez', 'ian.m@email.com', 'hash123', '555-0109', 'Patient'),
('Julia', 'Anderson', 'julia.a@email.com', 'hash123', '555-0110', 'Patient'),
('Kevin', 'Taylor', 'kevin.t@email.com', 'hash123', '555-0111', 'Patient'),
('Laura', 'Thomas', 'laura.t@email.com', 'hash123', '555-0112', 'Patient'),
('Mike', 'Hernandez', 'mike.h@email.com', 'hash123', '555-0113', 'Patient'),
('Nancy', 'Moore', 'nancy.m@email.com', 'hash123', '555-0114', 'Patient'),
('Oscar', 'Martin', 'oscar.m@email.com', 'hash123', '555-0115', 'Patient'),
('Peter', 'Jackson', 'peter.j@email.com', 'hash123', '555-0116', 'Patient'),
('Quinn', 'Thompson', 'quinn.t@email.com', 'hash123', '555-0117', 'Patient'),
('Rachel', 'White', 'rachel.w@email.com', 'hash123', '555-0118', 'Patient'),
('Steve', 'Lopez', 'steve.l@email.com', 'hash123', '555-0119', 'Patient'),
('Tina', 'Lee', 'tina.l@email.com', 'hash123', '555-0120', 'Patient'),
('Ursula', 'Gonzalez', 'ursula.g@email.com', 'hash123', '555-0121', 'Patient'),
('Victor', 'Harris', 'victor.h@email.com', 'hash123', '555-0122', 'Patient'),
('Wendy', 'Clark', 'wendy.c@email.com', 'hash123', '555-0123', 'Patient'),
('Xavier', 'Lewis', 'xavier.l@email.com', 'hash123', '555-0124', 'Patient'),
('Yvonne', 'Robinson', 'yvonne.r@email.com', 'hash123', '555-0125', 'Patient'),
('Zach', 'Walker', 'zach.w@email.com', 'hash123', '555-0126', 'Patient'),
('Adam', 'Perez', 'adam.p@email.com', 'hash123', '555-0127', 'Patient'),
('Bella', 'Hall', 'bella.h@email.com', 'hash123', '555-0128', 'Patient'),
('Carl', 'Young', 'carl.y@email.com', 'hash123', '555-0129', 'Patient'),
('Debbie', 'Allen', 'debbie.a@email.com', 'hash123', '555-0130', 'Patient');

-- 8. Insert Patients Details (30 Patients, IDs 11-40)
INSERT INTO patients (PatientID, DateOfBirth, Gender, Address, Image_url, BloodType) VALUES
(11, '1990-05-15', 'F', '123 Maple St', 'p11.jpg', 'A+'),
(12, '1985-08-22', 'M', '456 Oak Ave', 'p12.jpg', 'O-'),
(13, '1995-02-10', 'M', '789 Pine Ln', 'p13.jpg', 'B+'),
(14, '1982-11-30', 'F', '321 Elm St', 'p14.jpg', 'AB+'),
(15, '2001-07-04', 'M', '654 Cedar Dr', 'p15.jpg', 'O+'),
(16, '1975-09-12', 'F', '987 Birch Rd', 'p16.jpg', 'A-'),
(17, '1968-03-25', 'M', '159 Walnut St', 'p17.jpg', 'B-'),
(18, '1999-12-01', 'F', '753 Spruce Ct', 'p18.jpg', 'AB-'),
(19, '1988-06-18', 'M', '246 Ash Way', 'p19.jpg', 'O+'),
(20, '1992-04-14', 'F', '135 Fir Pl', 'p20.jpg', 'A+'),
(21, '1970-10-30', 'M', '864 Cherry Ln', 'p21.jpg', 'B+'),
(22, '1980-01-20', 'F', '975 Willow Blvd', 'p22.jpg', 'O-'),
(23, '1996-05-05', 'M', '531 Poplar Dr', 'p23.jpg', 'AB+'),
(24, '2005-08-15', 'F', '642 Sycamore St', 'p24.jpg', 'A+'),
(25, '1960-11-22', 'M', '753 Redwood Ave', 'p25.jpg', 'O+'),
(26, '1993-02-28', 'M', '864 Cypress Rd', 'p26.jpg', 'B-'),
(27, '1987-07-07', 'F', '975 Magnolia Ln', 'p27.jpg', 'AB-'),
(28, '1978-09-14', 'F', '159 Hawthorn St', 'p28.jpg', 'A-'),
(29, '1955-12-05', 'M', '268 Juniper Way', 'p29.jpg', 'O+'),
(30, '2000-04-18', 'M', '379 Sequoia Ct', 'p30.jpg', 'B+'),
(31, '1991-10-25', 'M', '480 Hemlock Pl', 'p31.jpg', 'AB+'),
(32, '1984-03-09', 'F', '591 Alder Dr', 'p32.jpg', 'O-'),
(33, '1972-06-21', 'F', '602 Larch Ln', 'p33.jpg', 'A+'),
(34, '1998-01-15', 'M', '713 Dogwood St', 'p34.jpg', 'B+'),
(35, '1989-08-08', 'M', '824 Mulberry Ave', 'p35.jpg', 'O+'),
(36, '1994-11-19', 'F', '935 Holly Blvd', 'p36.jpg', 'AB-'),
(37, '1965-02-04', 'M', '046 Ivy Rd', 'p37.jpg', 'A-'),
(38, '1979-05-27', 'F', '157 Laurel Ct', 'p38.jpg', 'B-'),
(39, '2002-09-09', 'M', '268 Myrtle Pl', 'p39.jpg', 'O+'),
(40, '1983-12-31', 'F', '379 Palm Way', 'p40.jpg', 'A+');

-- 9. Insert Medical Info
INSERT INTO medical_info (PatientID, InfoType, Name) VALUES
(11, 'ChronicDisease', 'Diabetes'),
(12, 'ChronicDisease', 'Hypertension'), (12, 'Allergy', 'Medication'),
(13, 'ChronicDisease', 'Asthma'), (13, 'Allergy', 'Environmental'),
(14, 'ChronicDisease', 'ChronicOther'), (14, 'Allergy', 'Food'),
(15, 'ChronicDisease', 'Diabetes'), (15, 'ChronicDisease', 'Hypertension'),
(16, 'Allergy', 'Food'), (16, 'Allergy', 'AllergyOther'),
(17, 'ChronicDisease', 'Hypertension'), (17, 'ChronicDisease', 'Asthma'), (17, 'Allergy', 'Medication'),
(18, 'Allergy', 'Environmental'),
(19, 'ChronicDisease', 'ChronicOther'),
(20, 'ChronicDisease', 'Diabetes'), (20, 'Allergy', 'Food'),
(21, 'ChronicDisease', 'Asthma'),
(22, 'ChronicDisease', 'Hypertension'),
(23, 'Allergy', 'Medication'),
(24, 'Allergy', 'Food'),
(25, 'ChronicDisease', 'ChronicOther'), (25, 'Allergy', 'AllergyOther'),
(26, 'ChronicDisease', 'Diabetes'), (26, 'Allergy', 'Environmental'), (26, 'Allergy', 'Food'),
(27, 'ChronicDisease', 'Hypertension'), (27, 'ChronicDisease', 'Asthma'),
(28, 'Allergy', 'AllergyOther'), 
(29, 'ChronicDisease', 'ChronicOther'),
(30, 'ChronicDisease', 'Diabetes'), (30, 'ChronicDisease', 'Hypertension'), (30, 'Allergy', 'Medication'),
(31, 'ChronicDisease', 'Asthma'), (31, 'Allergy', 'Environmental'),
(32, 'Allergy', 'Food'),
(33, 'Allergy', 'Medication'),
(34, 'ChronicDisease', 'ChronicOther'),
(35, 'ChronicDisease', 'Diabetes'),
(36, 'ChronicDisease', 'Hypertension'),
(37, 'Allergy', 'AllergyOther'),
(38, 'ChronicDisease', 'Asthma'), (38, 'Allergy', 'Food'),
(39, 'ChronicDisease', 'ChronicOther'), (39, 'Allergy', 'Environmental'),
(40, 'ChronicDisease', 'Diabetes'), (40, 'ChronicDisease', 'Hypertension'), (40, 'Allergy', 'Food'), (40, 'Allergy', 'Medication');

-- 10. Insert Appointments (25 Appointments)
-- All slots are strictly 30 minutes with no overlaps
INSERT INTO appointments (PatientID, DoctorID, AppointmentDate, StartTime, EndTime, Status) VALUES
-- Completed Appointments (15)
(11, 1, '2024-11-04', '09:00:00', '09:30:00', 'Completed'), -- Mon 9:00
(12, 2, '2024-11-05', '13:00:00', '13:30:00', 'Completed'), -- Tue 13:00
(14, 7, '2024-11-05', '13:30:00', '14:00:00', 'Completed'), -- Tue 13:30
(16, 3, '2024-11-04', '08:30:00', '09:00:00', 'Completed'), -- Mon 8:30
(17, 9, '2024-11-05', '15:00:00', '15:30:00', 'Completed'), -- Tue 15:00
(20, 4, '2024-11-07', '14:00:00', '14:30:00', 'Completed'), -- Thu 14:00
(21, 1, '2024-11-04', '10:00:00', '10:30:00', 'Completed'), -- Mon 10:00
(24, 6, '2024-11-06', '11:00:00', '11:30:00', 'Completed'), -- Wed 11:00
(25, 8, '2024-11-06', '08:30:00', '09:00:00', 'Completed'), -- Wed 8:30
(27, 2, '2024-11-05', '14:00:00', '14:30:00', 'Completed'), -- Tue 14:00
(29, 9, '2024-11-05', '16:00:00', '16:30:00', 'Completed'), -- Tue 16:00
(30, 10, '2024-11-06', '10:30:00', '11:00:00', 'Completed'), -- Wed 10:30
(31, 3, '2024-11-04', '09:00:00', '09:30:00', 'Completed'), -- Mon 9:00
(34, 7, '2024-11-07', '13:30:00', '14:00:00', 'Completed'), -- Thu 13:30
(36, 1, '2024-11-08', '09:00:00', '09:30:00', 'Completed'), -- Fri 9:00

-- Other Statuses (10)
(15, 1, '2024-11-08', '10:00:00', '10:30:00', 'Rescheduled'), -- Fri 10:00
(22, 2, '2024-11-07', '13:00:00', '13:30:00', 'Booked'),      -- Thu 13:00
(26, 1, '2024-11-11', '09:00:00', '09:30:00', 'Cancelled'),   -- Mon 9:00
(32, 4, '2024-11-07', '14:30:00', '15:00:00', 'Rescheduled'), -- Thu 14:30
(33, 5, '2024-11-04', '09:00:00', '09:30:00', 'Rescheduled'), -- Mon 9:00
(35, 9, '2024-11-10', '15:00:00', '15:30:00', 'Booked'),      -- Sun 15:00
(38, 2, '2024-11-12', '14:00:00', '14:30:00', 'Booked'),      -- Tue 14:00
(39, 8, '2024-11-13', '09:00:00', '09:30:00', 'Booked'),      -- Wed 9:00
(40, 10, '2024-11-15', '10:30:00', '11:00:00', 'Booked'),     -- Fri 10:30
(13, 3, '2024-11-16', '08:30:00', '09:00:00', 'Booked');      -- Sat 8:30

-- 11. Insert Medical Records (For Completed Appointments)
INSERT INTO medicalrecords (AppointmentID, PatientID, DoctorID, Diagnosis, Notes, Drug) VALUES
(1, 11, 1, 'Diabetes Checkup', 'Routine checkup. Blood sugar levels stable.', 'Metformin'),
(2, 12, 2, 'Hypertension Management', 'BP slightly elevated. Advised low salt diet.', 'Lisinopril'),
(3, 14, 7, 'Arthritis Pain', 'Patient complains of joint pain in knees.', 'Ibuprofen'),
(4, 16, 3, 'Allergic Dermatitis', 'Skin rash due to food allergy.', 'Hydrocortisone Cream'),
(5, 17, 9, 'Tension Headache', 'Headaches related to stress and BP.', 'Acetaminophen'),
(6, 20, 4, 'Diabetic Skin Infection', 'Minor fungal infection on foot.', 'Clotrimazole'),
(7, 21, 1, 'Heart Palpitations', 'Likely stress induced. ECG normal.', 'None'),
(8, 24, 6, 'Mild Allergic Reaction', 'Reaction to peanuts. Administered antihistamine.', 'Benadryl'),
(9, 25, 8, 'Joint Stiffness', 'General stiffness due to age.', 'Naproxen'),
(10, 27, 2, 'BP Checkup', 'Blood pressure is well controlled.', 'Continue Meds'),
(11, 29, 9, 'Migraine', 'Severe migraine episode.', 'Sumatriptan'),
(12, 30, 10, 'Diabetic Neuropathy', 'Tingling in extremities reported.', 'Gabapentin'),
(13, 31, 3, 'Eczema Flare', 'Flare up due to environmental factors.', 'Topical Steroids'),
(14, 34, 7, 'Lumbar Strain', 'Back pain from lifting heavy objects.', 'Muscle Relaxant'),
(15, 36, 1, 'Hypertension Follow-up', 'Stable. No changes needed.', 'Amlodipine');

