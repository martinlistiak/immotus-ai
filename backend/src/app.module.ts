import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SceneModule } from './api/scene/scene.module';
import { ConversationModule } from './api/conversation/conversation.module';
import { DatabaseModule } from './database.module';
import { UserModule } from './api/user/user.module';
import { UserMiddleware } from './middlewares/user.middleware';

@Module({
  imports: [SceneModule, ConversationModule, DatabaseModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
