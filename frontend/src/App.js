import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import EmployeeTable from './components/EmployeeTable';
import EmployeeForm from './components/EmployeeForm';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './services/employeeApi';

function App() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Apply search and department filters
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter]);

  // Extract unique departments from employees
  useEffect(() => {
    const uniqueDepts = [...new Set(employees.map((emp) => emp.department))].sort();
    setDepartments(uniqueDepts);
  }, [employees]);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle department filter change
  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
  };

  // Handle add employee button click
  const handleAddClick = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  // Handle edit employee
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  // Handle delete employee with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        setSuccessMessage('Employee deleted successfully');
        fetchEmployees();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete employee');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Handle form submission (add or edit)
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEmployee) {
        // Update existing employee
        await updateEmployee(selectedEmployee.id, formData);
        setSuccessMessage('Employee updated successfully');
      } else {
        // Create new employee
        await createEmployee(formData);
        setSuccessMessage('Employee created successfully');
      }
      setShowForm(false);
      setSelectedEmployee(null);
      fetchEmployees();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save employee');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Employee Resource Directory</h1>
      </header>

      <main className="app-main">
        {/* Success Message */}
        {successMessage && (
          <div className="message message-success">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="message message-error">
            <div>{error}</div>
            <button onClick={() => fetchEmployees()} className="btn-retry">
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="controls-section">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                departments={departments}
                departmentFilter={departmentFilter}
                onDepartmentChange={handleDepartmentChange}
              />
              <button className="btn-add" onClick={handleAddClick}>
                + Add Employee
              </button>
            </div>

            {/* Employee Table */}
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          employees={employees}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

export default App;
