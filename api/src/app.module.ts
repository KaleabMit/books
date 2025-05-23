import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './auth/user-roles';
import { MessageModule } from './message/message.module';
import { ReplyModule } from './reply/reply.module';
import { AdminMessagingModule } from './admin-messaging/admin-messaging.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { RatingModule } from './rating/rating.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VerificationModule } from './verification/verification.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { BlogModule } from './blog/blog.module';
import { TeamModule } from './team/team.module';
import { BookclubModule } from './bookclub/bookclub.module';
import { RecommendModule } from './recommend/recommend.module';
import { CsvModule } from './csv/csv.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
    type:'mysql',
    database:'books',
    port:3306,
    host:'localhost',
    username:'root',
    password:'Mysql@@@82987932',
    autoLoadEntities:true,
    synchronize:true
    }),
    PostModule,
    CategoryModule,
    AuthModule,
    AccessControlModule.forRoles(roles),
    MessageModule,
    ReplyModule,
    AdminMessagingModule,
    RecommendationModule,
    RatingModule,
    FavoritesModule,
    CommentsModule,
    NotificationsModule,
    VerificationModule,
    EmailModule,
    EventEmitterModule.forRoot(),
    BlogModule,
    TeamModule,
    BookclubModule,
    RecommendModule,
    CsvModule,
    SubscribeModule,
    OtpModule
  ],
  controllers: [AppController],
  providers: [AppService]
  
})
export class AppModule {}
