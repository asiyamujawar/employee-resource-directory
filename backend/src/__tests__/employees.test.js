const request = require('supertest');
const app = require('../app');

describe('Employee API - POST /api/employees', () => {
  it('should reject POST request with missing required field (name)', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({
        email: 'test@example.com',
        department: 'Engineering',
        role: 'Engineer',
        status: 'active',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name is required');
  });
});
