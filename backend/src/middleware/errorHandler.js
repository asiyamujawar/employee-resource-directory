// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Email already exists',
      status: 400,
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Invalid manager_id - manager does not exist',
      status: 400,
    });
  }

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({
      error: err.message,
      status: 400,
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      error: err.message,
      status: 404,
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
};

module.exports = errorHandler;
