import { Module } from '@nestjs/common';
import {ChatbotService} from './chatbot.service';
import { SwiftchatModule } from 'src/swiftchat/swiftchat.module'; // Correct the import path as necessary
import IntentClassifier from '../intent/intent.classifier';
import { UserService } from 'src/model/user.service';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { MessageService } from 'src/message/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/model/user.entity';
import { KhabriMediaNewsService } from 'src/khabriMedia/newsFetching';
@Module({
  imports: [SwiftchatModule,  TypeOrmModule.forFeature([User])], // Import SwiftchatModule
  providers: [
    ChatbotService,
    IntentClassifier,
    UserService,
    KhabriMediaNewsService,
    {
      provide: MessageService,
      useClass: SwiftchatMessageService,
    },
  ],
  exports: [ChatbotService, IntentClassifier],
})
export class ChatbotModule {}
