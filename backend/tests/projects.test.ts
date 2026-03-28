import { request, cleanDb, prisma, createTestUser, createTestProject } from './helpers';

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

describe('GET /api/projects', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request.get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns paginated projects for authenticated user', async () => {
    const { accessToken } = await createTestUser({ email: 'user1@example.com' });
    const res = await request
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/projects', () => {
  it('creates a project for an authenticated user', async () => {
    const { accessToken } = await createTestUser({ email: 'owner@example.com' });

    const res = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'My Project', description: 'Test description' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('My Project');
  });

  it('returns 401 without token', async () => {
    const res = await request.post('/api/projects').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('returns 422 without name', async () => {
    const { accessToken } = await createTestUser({ email: 'owner2@example.com' });
    const res = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns 403 when accessed by a non-member', async () => {
    const { user: owner } = await createTestUser({ email: 'owner3@example.com' });
    const project = await createTestProject(owner.id);
    const { accessToken: nonMemberToken } = await createTestUser({ email: 'stranger@example.com' });

    const res = await request
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${nonMemberToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns project for authorized member', async () => {
    const { user: owner, accessToken } = await createTestUser({ email: 'owner4@example.com' });
    const project = await createTestProject(owner.id);

    const res = await request
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(project.id);
  });
});
