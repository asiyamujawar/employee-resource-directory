const pool = require('../config/db');

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateStatus = (status) => {
  return ['active', 'inactive'].includes(status);
};

// GET all employees with search and department filter
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    let query = `
      SELECT 
        e.id, 
        e.name, 
        e.email, 
        e.department, 
        e.role, 
        e.manager_id,
        e.status,
        e.created_at,
        m.name as manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND e.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (department) {
      query += ' AND e.department = ?';
      params.push(department);
    }

    query += ' ORDER BY e.id ASC';

    const connection = await pool.getConnection();
    const [employees] = await connection.execute(query, params);
    connection.release();

    res.json({
      status: 200,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// GET employee by ID
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [employees] = await connection.execute(
      `
      SELECT 
        e.id, 
        e.name, 
        e.email, 
        e.department, 
        e.role, 
        e.manager_id,
        e.status,
        e.created_at,
        m.name as manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
      `,
      [id]
    );
    connection.release();

    if (employees.length === 0) {
      const error = new Error(`Employee with ID ${id} not found`);
      error.status = 404;
      throw error;
    }

    res.json({
      status: 200,
      data: employees[0],
    });
  } catch (err) {
    next(err);
  }
};

// CREATE new employee
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, role, manager_id, status } = req.body;

    // Validation
    if (!name || !name.trim()) {
      const error = new Error('Name is required');
      error.status = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error('Email is required');
      error.status = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error('Invalid email format');
      error.status = 400;
      throw error;
    }

    if (!department || !department.trim()) {
      const error = new Error('Department is required');
      error.status = 400;
      throw error;
    }

    if (!role || !role.trim()) {
      const error = new Error('Role is required');
      error.status = 400;
      throw error;
    }

    const finalStatus = status || 'active';
    if (!validateStatus(finalStatus)) {
      const error = new Error('Status must be "active" or "inactive"');
      error.status = 400;
      throw error;
    }

    // Check if employee cannot be their own manager
    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
      if (manager_id === 0 || isNaN(manager_id)) {
        const error = new Error('Invalid manager_id');
        error.status = 400;
        throw error;
      }

      // Verify manager exists
      const connection = await pool.getConnection();
      const [managers] = await connection.execute('SELECT id FROM employees WHERE id = ?', [manager_id]);
      connection.release();

      if (managers.length === 0) {
        const error = new Error('Invalid manager_id - manager does not exist');
        error.status = 400;
        throw error;
      }
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `
      INSERT INTO employees (name, email, department, role, manager_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email, department, role, manager_id || null, finalStatus]
    );
    connection.release();

    res.status(201).json({
      status: 201,
      message: 'Employee created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        department,
        role,
        manager_id: manager_id || null,
        status: finalStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, department, role, manager_id, status } = req.body;

    // Check if employee exists
    const connection = await pool.getConnection();
    const [existingEmployee] = await connection.execute('SELECT id FROM employees WHERE id = ?', [id]);

    if (existingEmployee.length === 0) {
      connection.release();
      const error = new Error(`Employee with ID ${id} not found`);
      error.status = 404;
      throw error;
    }

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      connection.release();
      const error = new Error('Name cannot be empty');
      error.status = 400;
      throw error;
    }

    if (email !== undefined && (!email || !email.trim())) {
      connection.release();
      const error = new Error('Email cannot be empty');
      error.status = 400;
      throw error;
    }

    if (email && !validateEmail(email)) {
      connection.release();
      const error = new Error('Invalid email format');
      error.status = 400;
      throw error;
    }

    if (department !== undefined && (!department || !department.trim())) {
      connection.release();
      const error = new Error('Department cannot be empty');
      error.status = 400;
      throw error;
    }

    if (role !== undefined && (!role || !role.trim())) {
      connection.release();
      const error = new Error('Role cannot be empty');
      error.status = 400;
      throw error;
    }

    if (status !== undefined && !validateStatus(status)) {
      connection.release();
      const error = new Error('Status must be "active" or "inactive"');
      error.status = 400;
      throw error;
    }

    // Check if trying to set as own manager
    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
      if (parseInt(manager_id) === parseInt(id)) {
        connection.release();
        const error = new Error('Employee cannot be their own manager');
        error.status = 400;
        throw error;
      }

      if (manager_id && !isNaN(manager_id)) {
        const [managers] = await connection.execute('SELECT id FROM employees WHERE id = ?', [manager_id]);
        if (managers.length === 0) {
          connection.release();
          const error = new Error('Invalid manager_id - manager does not exist');
          error.status = 400;
          throw error;
        }
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(department);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (manager_id !== undefined) {
      updateFields.push('manager_id = ?');
      updateValues.push(manager_id || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      connection.release();
      const error = new Error('No fields to update');
      error.status = 400;
      throw error;
    }

    updateValues.push(id);

    const updateQuery = `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`;

    await connection.execute(updateQuery, updateValues);
    connection.release();

    res.json({
      status: 200,
      message: 'Employee updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// DELETE employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [existingEmployee] = await connection.execute('SELECT id FROM employees WHERE id = ?', [id]);

    if (existingEmployee.length === 0) {
      connection.release();
      const error = new Error(`Employee with ID ${id} not found`);
      error.status = 404;
      throw error;
    }

    // Delete employee (sets manager_id to NULL for employees who report to them)
    await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
    connection.release();

    res.json({
      status: 200,
      message: 'Employee deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
