require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Only start server if this file is run directly (not imported for tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✓ Employee Directory API running on http://localhost:${PORT}`);
    console.log(`✓ Endpoints: http://localhost:${PORT}/api/employees`);
  });
}

module.exports = app;
