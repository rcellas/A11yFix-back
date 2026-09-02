import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './infrastructure/http/modules/app.module';
import { loadEnvConfig } from './config/env.config';

async function bootstrap(): Promise<void> {
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: config.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('A11yFix API')
    .setDescription(
      'Agent-native accessibility QA platform backend: audit orchestration, WAI-ARIA pattern analysis, remediation, and verification.',
    )
    .setVersion('0.1.0')
    .addTag('Health', 'Liveness and service status probes')
    .addTag('Audits', 'Accessibility audit orchestration')
    .addTag('Findings', 'WCAG and pattern accessibility findings')
    .addTag('Remediations', 'Fix proposals, approvals, and verification')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.PORT);
  console.log(`[A11yFix API] Running on http://localhost:${config.PORT}`);
  console.log(`[A11yFix API] Swagger docs available at http://localhost:${config.PORT}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('[A11yFix API] Bootstrap failure:', err);
  process.exit(1);
});
