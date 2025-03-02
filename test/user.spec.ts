import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { JwtGuard } from '../src/common/jwt.guard';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: jest
          .fn()
          .mockImplementation((context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { sub: 155, name: 'test', username: 'test' }; // 🟢 Mock user login
            return true;
          }),
      })
      .compile();

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

  // Get user current
  describe('GET /api/users/:id', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });
    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/1')
        .set('Authorization', 'wrong');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get user', async () => {
      const user = await testService.getUser();
      const userid = user.id;
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userid}`)
        .set('Authorization', 'Bearer token');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.createdAt).toBeDefined();
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
          username: 'test',
          name: 'test',
          email: 'test@example.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.image).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should be rejected if email and username already exists', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          name: 'test',
          email: 'test@example.com',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(409);
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
          username: '',
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
          username: 'test',
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
          username: 'test',
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

  // Logout
  describe('DELETE /api/users/logout', () => {
    let agent: request.SuperAgentTest;

    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();

      // Gunakan agent untuk mengelola cookie
      agent = request.agent(app.getHttpServer());
    });

    it('should be rejected if token is invalid', async () => {
      // Ambil CSRF token
      const csrfResponse = await agent.get('/api/users/csrf');
      const csrfToken = csrfResponse.body.csrfToken;
      const response = await agent
        .delete('/api/users/logout')
        .set('Authorization', 'wrong') // Token akses tidak valid
        .set('X-CSRF-Token', csrfToken); // CSRF token

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to logout', async () => {
      // Ambil CSRF token
      const csrfResponse = await agent.get('/api/users/csrf');
      const csrfToken = csrfResponse.body.csrfToken;

      // Kirim permintaan DELETE dengan CSRF token
      const logoutResponse = await agent
        .delete('/api/users/logout')
        .set('Authorization', 'test') // Token akses yang valid
        .set('X-CSRF-Token', csrfToken); // CSRF token

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.data.id).toBeDefined();
      expect(logoutResponse.body.data.name).toBe('test');
      expect(logoutResponse.body.data.email).toBe('test@example.com');
      expect(logoutResponse.body.data.createdAt).toBeDefined();
      expect(logoutResponse.body.data.token).toBeNull();
    });
  });

  // Delete user
  describe('DELETE /api/users/current', () => {
    let agent: request.SuperAgentTest;
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();

      // Gunakan agent untuk mengelola cookie
      agent = request.agent(app.getHttpServer());
    }, 100000);
    it('should be rejected if request is authentication invalid', async () => {
      // Ambil CSRF token
      const csrfResponse = await agent.get('/api/users/csrf');
      const csrfToken = csrfResponse.body.csrfToken;
      const response = await agent
        .delete('/api/users/current')
        .set('Authorization', 'wrong') // Token akses tidak valid
        .set('X-CSRF-Token', csrfToken); // CSRF token

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if request is password invalid', async () => {
      // Ambil CSRF token
      const csrfResponse = await agent.get('/api/users/csrf');
      const csrfToken = csrfResponse.body.csrfToken;
      const response = await agent
        .delete('/api/users/current')
        .send({
          password: 'wrong',
        })
        .set('Authorization', 'test') // Token akses tidak valid
        .set('X-CSRF-Token', csrfToken); // CSRF token

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete', async () => {
      const csrfResponse = await agent.get('/api/users/csrf');
      const csrfToken = csrfResponse.body.csrfToken;
      const response = await agent
        .delete('/api/users/current')
        .send({
          password: 'test',
        })
        .set('Authorization', 'test') // Token akses tidak valid
        .set('X-CSRF-Token', csrfToken); // CSRF token

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });
});
