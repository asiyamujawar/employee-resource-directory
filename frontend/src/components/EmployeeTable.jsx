import React from 'react';
import '../styles/EmployeeTable.css';

function EmployeeTable({ employees, onEdit, onDelete }) {
  if (!employees || employees.length === 0) {
    return <div className="no-data">No employees found.</div>;
  }

  return (
    <div className="table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Manager</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>{employee.manager_name || '—'}</td>
              <td>
                <span className={`status-badge status-${employee.status}`}>
                  {employee.status}
                </span>
              </td>
              <td className="actions">
                <button
                  className="btn-edit"
                  onClick={() => onEdit(employee)}
                  title="Edit employee"
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(employee.id)}
                  title="Delete employee"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
