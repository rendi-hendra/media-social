import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

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
    app.use(csurf({ cookie: true }));

    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });
  // Get CSRF token
  describe('GET /api/users/csrf', () => {
    it('should be able to get csrf token', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/users/csrf',
      );
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
    });
  });

  // Register
  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: '',
          email: 'test@example.com',
          password: 'test',
        });
      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'test',
          email: 'test@example.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should be rejected if email already exists', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'test',
          email: 'test@example.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
  // Login
  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: '',
          password: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if request is emal or password is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'salah',
        });

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });
  });
});
