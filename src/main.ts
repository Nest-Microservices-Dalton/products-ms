import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';


async function bootstrap() {
  const logger = new Logger('Main');

  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options : {
        port : envs.port
      }
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // await app.listen( envs.port );
  // logger.log(`App running on port ${ envs.port }`);

  await app.listen( );
  logger.log(`Products Microservices running on port ${ envs.port }`);
}
bootstrap();
