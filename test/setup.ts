import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaClientExceptionFilter } from '../src/prisma/prisma-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import './handlers';

const port = process.env.PORT || 8081;
let app: INestApplication;
let prisma: PrismaService;

export async function initApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new PrismaClientExceptionFilter(app.get(HttpAdapterHost)));

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  await app.init();
  await app.listen(port);
  return app;
}

export async function initPrisma() {
  prisma = app.get(PrismaService);
  await prisma.cleanDb();
  return prisma;
}

export function getApp() {
  return app;
}

export function getPrisma() {
  return prisma;
}

global.beforeAll(async () => {
  app = await initApp();
  prisma = await initPrisma();
  await pactum.request.setBaseUrl(`http://localhost:${port}`);
  await pactum.spec('createUser', 'user1');
  await pactum.spec('createUser', 'user2');
  await pactum.spec('createUser', 'user3');
});

global.afterAll(async () => {
  app.close();
});
