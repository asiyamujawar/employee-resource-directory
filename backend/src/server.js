require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✓ Employee Directory API running on http://localhost:${PORT}`);
    console.log(`✓ Endpoints: http://localhost:${PORT}/api/employees`);
  });
}

module.exports = app;
