# Postman Testing Guide for Employee Resource Directory API

## Setup

### 1. Download Postman
- Visit: https://www.postman.com/downloads/
- Install and open Postman

### 2. Import Collection

**Option A: Import JSON File**
1. Click "File" → "Import"
2. Select `GTT_Employee_Resource_Directory_API.postman_collection.json`
3. Click "Import"

**Option B: Create Manually**
- Create new collection "GTT Employee Resource Directory API"
- Add requests as described below

### 3. Ensure Backend is Running
```bash
cd backend
npm install
npm start
```
Should show: `✓ Employee Directory API running on http://localhost:5000`

---

## Test Cases

### 1. GET all employees
**URL:** `GET http://localhost:5000/api/employees`
**Expected Status:** 200
**Expected Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice.johnson@company.com",
      "department": "Executive",
      "role": "CEO",
      "manager_id": null,
      "manager_name": null,
      "status": "active",
      "created_at": "2024-..."
    },
    ...
  ]
}
```

### 2. GET employee by valid ID
**URL:** `GET http://localhost:5000/api/employees/1`
**Expected Status:** 200
**Expected Response:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@company.com",
    "manager_name": null,
    ...
  }
}
```

### 3. GET employee by invalid ID (404)
**URL:** `GET http://localhost:5000/api/employees/999`
**Expected Status:** 404
**Expected Response:**
```json
{
  "error": "Employee with ID 999 not found",
  "status": 404
}
```

### 4. GET with search filter
**URL:** `GET http://localhost:5000/api/employees?search=alice`
**Expected Status:** 200
**Expected Response:** Returns only employees with "alice" in name

### 5. GET with department filter
**URL:** `GET http://localhost:5000/api/employees?department=Engineering`
**Expected Status:** 200
**Expected Response:** Returns only Engineering department employees

### 6. POST valid employee
**URL:** `POST http://localhost:5000/api/employees`
**Body (JSON):**
```json
{
  "name": "Test Employee",
  "email": "test.employee@company.com",
  "department": "Engineering",
  "role": "Developer",
  "manager_id": 2,
  "status": "active"
}
```
**Expected Status:** 201
**Expected Response:**
```json
{
  "status": 201,
  "message": "Employee created successfully",
  "data": {
    "id": 13,
    "name": "Test Employee",
    "email": "test.employee@company.com",
    ...
  }
}
```

### 7. POST missing required field
**URL:** `POST http://localhost:5000/api/employees`
**Body (JSON):** Missing "name"
```json
{
  "email": "test2@company.com",
  "department": "Engineering",
  "role": "Developer"
}
```
**Expected Status:** 400
**Expected Response:**
```json
{
  "error": "Name is required",
  "status": 400
}
```

### 8. POST invalid email format
**URL:** `POST http://localhost:5000/api/employees`
**Body (JSON):**
```json
{
  "name": "Invalid Email",
  "email": "notanemail",
  "department": "Engineering",
  "role": "Developer"
}
```
**Expected Status:** 400
**Expected Response:**
```json
{
  "error": "Invalid email format",
  "status": 400
}
```

### 9. POST duplicate email
**URL:** `POST http://localhost:5000/api/employees`
**Body (JSON):** Using existing email "alice.johnson@company.com"
```json
{
  "name": "Alice Duplicate",
  "email": "alice.johnson@company.com",
  "department": "Engineering",
  "role": "Developer"
}
```
**Expected Status:** 400
**Expected Response:**
```json
{
  "error": "Email already exists",
  "status": 400
}
```

### 10. POST invalid manager_id
**URL:** `POST http://localhost:5000/api/employees`
**Body (JSON):**
```json
{
  "name": "Test Invalid Manager",
  "email": "test.invalid.mgr@company.com",
  "department": "Engineering",
  "role": "Developer",
  "manager_id": 999
}
```
**Expected Status:** 400
**Expected Response:**
```json
{
  "error": "Invalid manager_id - manager does not exist",
  "status": 400
}
```

### 11. PUT valid employee
**URL:** `PUT http://localhost:5000/api/employees/3`
**Body (JSON):**
```json
{
  "role": "Senior Engineer",
  "status": "inactive"
}
```
**Expected Status:** 200
**Expected Response:**
```json
{
  "status": 200,
  "message": "Employee updated successfully"
}
```

### 12. PUT non-existing employee (404)
**URL:** `PUT http://localhost:5000/api/employees/999`
**Body (JSON):**
```json
{
  "role": "Manager"
}
```
**Expected Status:** 404
**Expected Response:**
```json
{
  "error": "Employee with ID 999 not found",
  "status": 404
}
```

### 13. DELETE valid employee
**URL:** `DELETE http://localhost:5000/api/employees/5`
**Expected Status:** 200
**Expected Response:**
```json
{
  "status": 200,
  "message": "Employee deleted successfully"
}
```

### 14. DELETE non-existing employee (404)
**URL:** `DELETE http://localhost:5000/api/employees/999`
**Expected Status:** 404
**Expected Response:**
```json
{
  "error": "Employee with ID 999 not found",
  "status": 404
}
```

---

## Testing Checklist

- [ ] All 14 test cases pass with expected status codes
- [ ] GET returns manager_name via LEFT JOIN
- [ ] POST validates all required fields
- [ ] POST validates email format
- [ ] POST prevents duplicate emails
- [ ] POST prevents invalid manager_id
- [ ] PUT partial updates work
- [ ] DELETE removes employee
- [ ] 404 errors for non-existing IDs
- [ ] Search filter works
- [ ] Department filter works

---

## Common Issues

**Connection Refused?**
- Ensure backend is running: `npm start` from backend folder

**Email already exists?**
- Use unique emails for each test, or clear database and re-import schema

**Invalid manager_id?**
- Use valid employee IDs (1-12 from seed data)

**Status 500 errors?**
- Check backend console for errors
- Verify .env database credentials
- Ensure MySQL is running
