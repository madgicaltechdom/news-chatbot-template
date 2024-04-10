import { Module } from '@nestjs/common';
import { SwiftchatMessageService } from './swiftchat.service';
import { MessageModule } from 'src/message/message.module'; // Correct the import path as necessary

@Module({
  imports: [MessageModule], // Import MessageModule
  providers: [SwiftchatMessageService],
  exports: [SwiftchatMessageService],
})
export class SwiftchatModule {}
