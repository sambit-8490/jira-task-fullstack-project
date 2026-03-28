import { request, cleanDb, prisma, createTestUser, createTestProject, createTestTask } from './helpers';

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

describe('PATCH /api/tasks/:id', () => {
  it('member can update task status', async () => {
    const { user: owner } = await createTestUser({ email: 'owner5@example.com' });
    const { user: member, accessToken: memberToken } = await createTestUser({ email: 'member@example.com' });
    const project = await createTestProject(owner.id);

    // Add member to project
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: member.id, role: 'member' },
    });

    const task = await createTestTask(project.id);

    const res = await request
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('returns 403 when non-member tries to update task', async () => {
    const { user: owner } = await createTestUser({ email: 'owner6@example.com' });
    const { accessToken: strangerToken } = await createTestUser({ email: 'stranger2@example.com' });
    const project = await createTestProject(owner.id);
    const task = await createTestTask(project.id);

    const res = await request
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ status: 'done' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('member gets 403 when trying to delete task', async () => {
    const { user: owner } = await createTestUser({ email: 'owner7@example.com' });
    const { user: member, accessToken: memberToken } = await createTestUser({ email: 'member2@example.com' });
    const project = await createTestProject(owner.id);

    await prisma.projectMember.create({
      data: { projectId: project.id, userId: member.id, role: 'member' },
    });

    const task = await createTestTask(project.id);

    const res = await request
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('owner gets 200 when deleting task', async () => {
    const { user: owner, accessToken: ownerToken } = await createTestUser({ email: 'owner8@example.com' });
    const project = await createTestProject(owner.id);
    const task = await createTestTask(project.id);

    const res = await request
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 401 without token', async () => {
    const { user: owner } = await createTestUser({ email: 'owner9@example.com' });
    const project = await createTestProject(owner.id);
    const task = await createTestTask(project.id);

    const res = await request.delete(`/api/tasks/${task.id}`);
    expect(res.status).toBe(401);
  });
});
