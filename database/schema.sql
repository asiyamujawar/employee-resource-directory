-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS employee_directory;
USE employee_directory;

-- Drop table if exists (for clean resets)
DROP TABLE IF EXISTS employees;

-- Create employees table with self-referencing manager relationship
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  manager_id INT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create index on email for faster lookups
CREATE INDEX idx_email ON employees(email);
CREATE INDEX idx_department ON employees(department);

-- Seed data: realistic employees across multiple departments
INSERT INTO employees (name, email, department, role, manager_id, status) VALUES
-- CEO / Top-level (no manager)
('Alice Johnson', 'alice.johnson@company.com', 'Executive', 'CEO', NULL, 'active'),

-- Engineering Department
('Bob Smith', 'bob.smith@company.com', 'Engineering', 'Engineering Manager', 1, 'active'),
('Carol Davis', 'carol.davis@company.com', 'Engineering', 'Senior Engineer', 2, 'active'),
('David Wilson', 'david.wilson@company.com', 'Engineering', 'Engineer', 2, 'active'),
('Eve Martinez', 'eve.martinez@company.com', 'Engineering', 'Engineer', 2, 'inactive'),

-- Sales Department
('Frank Brown', 'frank.brown@company.com', 'Sales', 'Sales Manager', 1, 'active'),
('Grace Lee', 'grace.lee@company.com', 'Sales', 'Sales Representative', 6, 'active'),
('Henry Chen', 'henry.chen@company.com', 'Sales', 'Sales Representative', 6, 'active'),

-- Finance Department
('Iris Taylor', 'iris.taylor@company.com', 'Finance', 'Finance Manager', 1, 'active'),
('Jack Robinson', 'jack.robinson@company.com', 'Finance', 'Accountant', 9, 'active'),

-- HR Department
('Karen White', 'karen.white@company.com', 'HR', 'HR Manager', 1, 'active'),
('Leo Garcia', 'leo.garcia@company.com', 'HR', 'HR Specialist', 11, 'active');
