import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { User } from './entities/user.entity';
import { VerificationService } from 'src/verification/verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private jwtService: JwtService,
    private verificationTokenService: VerificationService,
    private emailService: EmailService
  ) {}

  async login(loginDto: UserLoginDto) {
    const user = await this.repo.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: loginDto.email })
      .getOne();
    if (!user) {
      throw new UnauthorizedException('Bad Credentials');
    } else {
      if (await this.verifyPassword(loginDto.password, user.password)) {
        const token = await this.jwtService.signAsync({
          email: user.email,
          id: user.id,
        });
        delete user.password;
        return { token, user };
      } else {
        throw new UnauthorizedException('Bad Credential, try again.');
      }
    }
  }

  async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async register(createUserDto: CreateUserDto) {
    const { email,username } = createUserDto;
    const checkForBoth = await this.repo.findOne({where:{email,username}});
    const checkForUser = await this.repo.findOne({ where: { email } });
    const checkForUsername = await this.repo.findOne({where:{username}});

    if(checkForBoth){
      throw new BadRequestException('Both Email and Username is already chosen, please choose a new one.');
    }
    if (checkForUser) {
      throw new BadRequestException('Email is already chosen, please choose a new one.');
    } 
    if(checkForUsername){
      throw new BadRequestException('Username is already chosen, please choose a new one.');
    }
    
      const user = new User();
      Object.assign(user, createUserDto);
      this.repo.create(user);
      await this.repo.save(user);
      delete user.password;
      return user;
    
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException(`User ID ${id} is not found`);
    }
    return user;
  }

 

//   async updateUser(id: number, updateAuthDto: UpdateAuthDto) {
//   await this.repo.update(id, updateAuthDto);
//   const updatedUser = await this.repo.findOne({ where: { id } });
//   if (!updatedUser) {
//     throw new NotFoundException(`User with ID ${id} not found after update`);
//   }
//   return updatedUser;
// }

async updateUser(id: number, updateAuthDto: UpdateAuthDto, photoUrl?: string) {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  Object.assign(user, updateAuthDto);

  if (photoUrl) {
    user.photo = photoUrl;
  }

  await this.repo.save(user);
  return user;
}



  async remove(id: number) {
    const del = await this.repo.delete(id);
    if (del.affected === 0) {
      throw new BadRequestException(`User ID ${id} is not found`);
    }
    return del;
  }

  // email verification start

  async generateEmailVerification(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`user with ID ${id} is not found`);
    }
  }

  async verifyEmail(id: number, token: string) {
    const invalidMessage = 'Invalid or Expired OTP';
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }
    
  if (user.emailVerifiedAt) {
    throw new UnprocessableEntityException('Account already verified');
  }

  const isValid = await this.verificationTokenService.validateOtp(
    user.id,
    token,
  );

  if (!isValid) {
    throw new UnprocessableEntityException(invalidMessage);
  }
    user.emailVerifiedAt = new Date();
    user.accountStatus = 'active';
    user.isVerified = true;
    await this.repo.save(user);
    return true;
  }

  // email verification end
}
