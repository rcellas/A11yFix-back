import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/http/modules/app.module';
import { ProblemDetailsFilter } from '../../src/infrastructure/http/filters/problem-details.filter';

describe('Audits HTTP API (E2E)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /audits should create a new audit and return 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/audits')
      .send({ url: 'https://example.com/checkout' })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(response.body.url).toBe('https://example.com/checkout');
    expect(response.body.status).toBe('created');
    expect(response.body.findingsCount).toBe(0);
  });

  it('POST /audits should return 400 Problem Details for invalid url', async () => {
    const response = await request(app.getHttpServer())
      .post('/audits')
      .send({ url: 'ftp://not-supported.com' })
      .expect(400);

    expect(response.body.type).toBe('https://httpstatuses.com/400');
    expect(response.body.title).toBe('Bad Request');
    expect(response.body.detail).toMatch(/Invalid target URL/i);
  });

  it('GET /audits/:id should return 200 for existing audit', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/audits')
      .send({ url: 'https://example.com/login' })
      .expect(201);

    const auditId = createRes.body.id;

    const getRes = await request(app.getHttpServer())
      .get(`/audits/${auditId}`)
      .expect(200);

    expect(getRes.body.id).toBe(auditId);
    expect(getRes.body.url).toBe('https://example.com/login');
  });

  it('GET /audits/:id should return 404 for non-existent audit', async () => {
    const randomUuid = '11111111-1111-4111-a111-111111111111';
    await request(app.getHttpServer())
      .get(`/audits/${randomUuid}`)
      .expect(404);
  });

  it('GET /audits/:id/findings should return array of findings', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/audits')
      .send({ url: 'https://example.com/dashboard' })
      .expect(201);

    const auditId = createRes.body.id;

    const findingsRes = await request(app.getHttpServer())
      .get(`/audits/${auditId}/findings`)
      .expect(200);

    expect(Array.isArray(findingsRes.body)).toBe(true);
    expect(findingsRes.body).toHaveLength(0);
  });
});
