import * as fs from 'fs';
import * as path from 'path';
import { Anthropic } from '@anthropic-ai/sdk';

type ConversationType = Anthropic.Messages.MessageParam[];

const conversationsFilePath = path.join(__dirname, '../../../conversations');

const makeSureDirectoryExists = () => {
  if (!fs.existsSync(conversationsFilePath)) {
    fs.mkdirSync(conversationsFilePath);
  }
};

export class ConversationRepository {
  findAll(): { name: string; conversation: ConversationType }[] {
    try {
      makeSureDirectoryExists();
      const conversations = fs.readdirSync(conversationsFilePath);
      return conversations.map((conversation) => ({
        name: conversation,
        conversation: JSON.parse(
          fs.readFileSync(
            path.join(conversationsFilePath, conversation),
            'utf8',
          ),
        ) as ConversationType,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  findByName(name: string) {
    makeSureDirectoryExists();
    const conversation = fs.readFileSync(
      path.join(conversationsFilePath, name),
      'utf8',
    );
    return JSON.parse(conversation) as ConversationType;
  }

  upsert(data: { name: string; conversation: ConversationType }) {
    makeSureDirectoryExists();
    fs.writeFileSync(
      path.join(conversationsFilePath, data.name),
      JSON.stringify(data.conversation, null, 2),
    );
    return { name: data.name, conversation: data.conversation };
  }

  delete(name: string) {
    makeSureDirectoryExists();
    fs.unlinkSync(path.join(conversationsFilePath, name));
    return { name };
  }

  rename(name: string, newName: string) {
    makeSureDirectoryExists();
    fs.renameSync(
      path.join(conversationsFilePath, name),
      path.join(conversationsFilePath, newName),
    );
    return { name: newName };
  }
}
