import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('handles signup request', () => {
    const email = 'tesst@test.com';
    return request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email, password: 'test' })
      .expect(201)
      .then((response) => {
        const { id, email: responseEmail } = response.body;
        expect(id).toBeDefined();
        expect(responseEmail).toEqual(email);
      });
  });

  it('register as a new user then get the currently logged in user', async () => {
    const email = 'asdif@gmail.com';
    const res = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email, password: 'asdf' })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/about-me')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
