import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { Anthropic } from '@anthropic-ai/sdk';

type ConversationType = Anthropic.Messages.MessageParam[];

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  getConversations(): { name: string; conversation: ConversationType }[] {
    return this.conversationRepository.findAll();
  }

  getConversation({ name }: { name: string }) {
    return this.conversationRepository.findByName(name);
  }

  upsertConversation({
    name,
    conversation,
  }: {
    name: string;
    conversation: ConversationType;
  }) {
    return this.conversationRepository.upsert({ name, conversation });
  }

  renameConversation({ name, newName }: { name: string; newName: string }) {
    return this.conversationRepository.rename(name, newName);
  }

  deleteConversation({ name }: { name: string }) {
    return this.conversationRepository.delete(name);
  }
}
