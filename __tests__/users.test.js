const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
// const UserService = require('../lib/services/UserService');

// Dummy user for testing
const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  // const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  // const { email } = user;
  const resp = await agent
    .post('/api/v1/users')
    .send({ ...mockUser, ...userProps });
  const user = resp.body;
  return [agent, user];
};

describe('user routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { firstName, lastName, email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('GET /me should return the currently logged in user', async () => {
    const [agent, user] = await registerAndLogin();
    const resp = await agent.get('/api/v1/users/me');
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('GET /me should return a 401 if not logged in', async () => {
    const resp = await request(app).get('/api/v1/users/me');
    expect(resp.status).toBe(401);
  });

  it('DELETE /api/v1/users/sessions should delete a session', async () => {
    const [agent, user] = await registerAndLogin();
    const deleteResp = await agent.delete('/api/v1/users/sessions');
    expect(deleteResp.status).toBe(204);
    const resp = await agent.get('/api/v1/users/me');
    expect(resp.status).toBe(401);
  });
});
