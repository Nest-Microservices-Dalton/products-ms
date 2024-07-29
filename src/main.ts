import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';


async function bootstrap() {
  const logger = new Logger('ProductsMS-Main');
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options : {
        servers : envs.natsServers
      }
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen( );
  logger.log(`Products Microservices running on port ${ envs.port }`);
}
bootstrap();
