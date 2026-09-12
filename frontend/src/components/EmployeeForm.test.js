import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeForm from './EmployeeForm';

describe('EmployeeForm Component', () => {
  it('should display validation error when form is submitted empty', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <EmployeeForm
        employee={null}
        employees={[]}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Click submit button without filling any fields
    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    // Check for validation error message
    const nameError = screen.getByText('Name is required');
    expect(nameError).toBeInTheDocument();

    // onSubmit should not be called if form is invalid
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
