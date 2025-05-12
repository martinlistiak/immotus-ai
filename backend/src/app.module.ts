import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SceneModule } from './api/scene/scene.module';
import { ConversationModule } from './api/conversation/conversation.module';
import { DatabaseModule } from './database.module';
import { UserModule } from './api/user/user.module';
import { UserMiddleware } from './middlewares/user.middleware';
import { ConversationService } from './api/conversation/conversation.service';
@Module({
  imports: [SceneModule, ConversationModule, DatabaseModule, UserModule],
  controllers: [AppController],
  providers: [ConversationService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
