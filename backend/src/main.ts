import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: true, // Permite todas as origens (em produção, especifique as origens permitidas)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Servir arquivos estáticos do frontend (antes do Swagger)
  // Opcional: só serve se o diretório existir
  const frontendPath = join(__dirname, '..', 'frontend-dist');
  if (fs.existsSync(frontendPath)) {
  app.useStaticAssets(frontendPath, {
    index: false,
    prefix: '/',
  });
  }

  const config = new DocumentBuilder()
    .setTitle('API Monopoly Game')
    .setDescription(
      'Aqui voce pode criar sala de bate papo e iniciar um jogo com saldo na conta sem precisar usar dinheiro fisico e realizar transacoes',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Rota catch-all para servir o index.html do frontend (SPA)
  // Deve vir DEPOIS de todas as outras rotas (Swagger, API, etc)
  // Só adiciona se o frontend existir
  if (fs.existsSync(frontendPath)) {
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('*', (req, res, next) => {
    // Não servir index.html para rotas da API
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(frontendPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
