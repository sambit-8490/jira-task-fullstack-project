import { request, cleanDb, prisma } from './helpers';

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe('alice@example.com');
  });

  it('returns 409 when email already exists', async () => {
    await request.post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/register').send({
      name: 'Alice 2',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('returns 422 on invalid input', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'short',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request.post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
    });
  });

  it('returns access + refresh tokens on valid credentials', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe('bob@example.com');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 on non-existent email', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
