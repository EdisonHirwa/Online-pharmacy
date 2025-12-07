-- Database: hospital_management

CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- Users Table (Admin, Doctor, Lab Tech, Pharmacist, Patient)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'lab_technician', 'pharmacist', 'patient') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- Patients Table (Extended profile for patients)
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT PRIMARY KEY,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    blood_group VARCHAR(5),
    medical_history TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Doctors Table (Extended profile for doctors)
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    schedule TEXT, -- JSON or text description of availability
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_specialization (specialization)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_date (appointment_date)
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    medications TEXT NOT NULL, -- JSON or formatted text
    instructions TEXT,
    status ENUM('pending', 'dispensed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Lab Tests Table
CREATE TABLE IF NOT EXISTS lab_tests (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    result_file VARCHAR(255), -- Path to uploaded PDF/Image
    result_notes TEXT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status ENUM('unpaid', 'paid', 'overdue') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Beds Table
CREATE TABLE IF NOT EXISTS beds (
    bed_id INT AUTO_INCREMENT PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    type ENUM('fowler', 'icu', 'general', 'semi_fowler') DEFAULT 'general',
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
    admission_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    bed_id INT,
    doctor_id INT,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME,
    reason TEXT,
    status ENUM('admitted', 'discharged') DEFAULT 'admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL
);

-- Fraud Alerts Table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    alert_type VARCHAR(100) NOT NULL, -- e.g., 'Duplicate Account', 'Suspicious Login'
    description TEXT,
    status ENUM('new', 'investigating', 'resolved') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert Default Admin (Password: Admin123!)
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (This is just an example hash, in real app generate properly)
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('System Admin', 'admin@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ============================================
-- AUTOMATED TRIGGERS
-- ============================================

-- 1. Appointment Notification Trigger
DROP TRIGGER IF EXISTS notify_appointment_created;
DELIMITER //
CREATE TRIGGER notify_appointment_created
AFTER INSERT ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, message, created_at)
    VALUES (NEW.doctor_id, CONCAT('New appointment booked for ', DATE_FORMAT(NEW.appointment_date, '%Y-%m-%d %H:%i')), NOW());
    INSERT INTO notifications (user_id, message, created_at)
    VALUES (NEW.patient_id, CONCAT('Your appointment is scheduled for ', DATE_FORMAT(NEW.appointment_date, '%Y-%m-%d %H:%i')), NOW());
END//
DELIMITER ;

-- 2. Lab Test Completion Trigger
DROP TRIGGER IF EXISTS notify_lab_test_complete;
DELIMITER //
CREATE TRIGGER notify_lab_test_complete
AFTER UPDATE ON lab_tests
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO notifications (user_id, message, created_at)
        VALUES (NEW.patient_id, CONCAT('Your lab test results for "', NEW.test_name, '" are ready to view'), NOW());
    END IF;
END//
DELIMITER ;

-- 3. Prescription Notification Trigger
DROP TRIGGER IF EXISTS notify_prescription_issued;
DELIMITER //
CREATE TRIGGER notify_prescription_issued
AFTER INSERT ON prescriptions
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, message, created_at)
    VALUES (NEW.patient_id, 'A new prescription has been issued for you', NOW());
END//
DELIMITER ;

-- 4. Lab Test Order Notification Trigger
DROP TRIGGER IF EXISTS notify_lab_order_created;
DELIMITER //
CREATE TRIGGER notify_lab_order_created
AFTER INSERT ON lab_tests
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, message, created_at)
    SELECT user_id, CONCAT('New lab test ordered: ', NEW.test_name), NOW()
    FROM users WHERE role = 'lab_technician';
END//
DELIMITER ;
