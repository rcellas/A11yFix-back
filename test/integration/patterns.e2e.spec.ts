import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/http/modules/app.module';
import { ProblemDetailsFilter } from '../../src/infrastructure/http/filters/problem-details.filter';

describe('Patterns HTTP API (E2E)', () => {
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

  it('POST /patterns/inspect should inspect DOM snapshot and return violations', async () => {
    const res = await request(app.getHttpServer())
      .post('/patterns/inspect')
      .send({
        targetElement: {
          tagName: 'div',
          attributes: { role: 'dialog', class: 'modal' },
          outerHtml: '<div role="dialog" class="modal"></div>',
        },
        patternType: 'DIALOG',
      })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].patternType).toBe('DIALOG');
    expect(res.body[0].passed).toBe(false);
    expect(res.body[0].violations.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].violations.some((v: { ruleId: string }) => v.ruleId === 'pattern:dialog-accessible-name')).toBe(true);
  });
});
