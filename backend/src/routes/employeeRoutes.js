const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

// GET all employees (with optional search and department filter)
router.get('/', getAllEmployees);

// GET employee by ID
router.get('/:id', getEmployeeById);

// POST new employee
router.post('/', createEmployee);

// PUT update employee
router.put('/:id', updateEmployee);

// DELETE employee
router.delete('/:id', deleteEmployee);

module.exports = router;
