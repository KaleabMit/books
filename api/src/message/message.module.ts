import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
   imports: [
    TypeOrmModule.forFeature([Message])
]
})
export class MessageModule {}
