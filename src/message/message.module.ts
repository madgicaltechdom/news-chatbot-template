import { Module } from '@nestjs/common';
import { MessageService } from './message.service'; 
import { CustomException } from 'src/common/exception/custom.exception';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';

@Module({
  providers: [
    {
      provide: MessageService,
      useClass: SwiftchatMessageService,     
    },
    CustomException,
  ],
  exports: [MessageService, CustomException],
})
export class MessageModule {}
