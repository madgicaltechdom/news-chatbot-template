import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService], // Provide actual implementation of UserService
  exports: [UserService], // Export the UserService to make it available for other modules
})
export class UserModule {}
