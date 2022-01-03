import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import config from '@app/db.config';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TagModule } from '@app/tag/tag.module';
import { UserModule } from '@app/user/user.module';
import { AuthMiddleware } from '@app/user/middlewares/auth.middleware';
import { ArticleModule } from '@app/article/article.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    TypeOrmModule.forRoot(config),
    TagModule,
    UserModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
