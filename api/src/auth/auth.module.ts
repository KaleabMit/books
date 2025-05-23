import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from 'src/email/email.module';
import { VerificationModule } from 'src/verification/verification.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret:'kmbsecretkey',
      signOptions:{
        algorithm:'HS512',
        expiresIn:'1d'
      }

    }),
    PassportModule.register({
      defaultStrategy:'jwt'
    }),
    EmailModule,
    VerificationModule,
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
})
export class AuthModule {}
