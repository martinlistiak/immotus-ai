import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SceneModule } from './api/scene/scene.module';
import { ConversationModule } from './api/conversation/conversation.module';
import { DatabaseModule } from './database.module';
import { UserModule } from './api/user/user.module';
import { FileModule } from './api/file/file.module';
import { UserMiddleware } from './middlewares/user.middleware';
import { ConversationService } from './api/conversation/conversation.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    SceneModule,
    ConversationModule,
    DatabaseModule,
    UserModule,
    FileModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [ConversationService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
