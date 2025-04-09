import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Anthropic } from '@anthropic-ai/sdk';

type ConversationType = Anthropic.Messages.MessageParam[];

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  getConversations(): { name: string; conversation: ConversationType }[] {
    return this.conversationService.getConversations();
  }

  @Get(':name')
  getConversation(@Param('name') name: string) {
    return this.conversationService.getConversation({ name });
  }

  @Post(':name')
  upsertConversation(
    @Param('name') name: string,
    @Body() body: { conversation: ConversationType },
  ) {
    return this.conversationService.upsertConversation({
      name,
      conversation: body.conversation,
    });
  }

  @Patch(':name/rename')
  renameConversation(
    @Param('name') name: string,
    @Body() body: { name: string },
  ) {
    return this.conversationService.renameConversation({
      name,
      newName: body.name,
    });
  }

  @Delete(':name')
  deleteConversation(@Param('name') name: string) {
    return this.conversationService.deleteConversation({ name });
  }
}
