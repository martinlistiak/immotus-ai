import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SceneModule } from './api/scene/scene.module';
import { ConversationModule } from './api/conversation/conversation.module';
@Module({
  imports: [SceneModule, ConversationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
