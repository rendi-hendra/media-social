import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { AppModule } from './../src/app.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    // Tambahkan pengecualian CSRF seperti di aplikasi utama
    app.use((req: Request, res: Response, next: NextFunction) => {
      const excludedRoutes = ['/api/users/login', '/api/users'];
      if (excludedRoutes.includes(req.path) && req.method === 'POST') {
        return next();
      }
      return csurf({ cookie: true })(req, res, next);
    });

    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  // Get profile current
  describe('GET /api/profiles/current', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });
    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profiles/current')
        .set('Authorization', 'wrong');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profiles/current')
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.image).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });
  });
});
