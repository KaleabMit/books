import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, Req, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { Response,Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUserGuard } from './current-user.guard';
import { CurrentUser } from './user.decorator';
import { User } from './entities/user.entity';
import { UpdateAuthDto } from './dto/update-user.dto';
import { ACGuard, UseRoles } from 'nest-access-control';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('login')
async userLogin(@Body() userLoginDto:UserLoginDto,@Res() res:Response) {
const{token,user}=await this.authService.login(userLoginDto);


res.cookie('IsAuthenticated', true, {maxAge:2*60*60*1000})
res.cookie('Authentication',token,{
  httpOnly:true,
  maxAge:2*60*60*1000
}); 
return res.send( {success:true,user});
}

@Post("register")
// @UseGuards(AuthGuard('jwt'), ACGuard)
// @UseRoles({ action: 'create', possession: 'any', resource: 'user' })
async userRegistration(@Body() userCreateDto: CreateUserDto) {
  return this.authService.register(userCreateDto);
}


@Get('authstatus')
@UseGuards(CurrentUserGuard)
authStatus(@CurrentUser() user:User){
  return{status: !!user,user}
}


@Post('logout')
logout(@Req() req:Request,@Res() res: Response){
  res.clearCookie("Authentication");
  res.clearCookie("IsAuthentication");
  return res.status(200).send({success:true});
}

@Get('users')
@UseGuards(CurrentUserGuard)
async getuser(){
  return this.authService.findAll();
}

@Get('users/:id')
@UseGuards(CurrentUserGuard)
async getOneUser(@Param('id') id:number){
return this.authService.findOne(id);
}

// @Patch(':id')
// @UseGuards(CurrentUserGuard)
// async updateUser(@Param('id') id: number, @Body() updateAuthDto: UpdateAuthDto) {
//   return this.authService.updateUser(id, updateAuthDto);
// }

@Patch(':id')
@UseGuards(CurrentUserGuard)
@UseInterceptors(FileInterceptor('photo', {
  storage: diskStorage({
    destination: './uploads/posts/pictures',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `person-m-${uniqueSuffix}${ext}`);
    },
  }),
}))
async updateUser(
  @Param('id') id: number,
  @Body() updateAuthDto: UpdateAuthDto,
  @UploadedFile() photo?: Express.Multer.File
) {
  const photoUrl = photo ? `http://localhost:5000/posts/pictures/${photo.filename}` : undefined;
  return this.authService.updateUser(id, updateAuthDto, photoUrl);
}


@Delete(':id')
@UseGuards(CurrentUserGuard)
@UseGuards(AuthGuard('jwt'), ACGuard)
@UseRoles({ action: 'delete', possession: 'any', resource: 'user' })
async deleteUser(@Param('id') id: number) {
  return this.authService.remove(id);
}

// email verification start

@Post('verification-otp')
@UseGuards(CurrentUserGuard)
async generateEmailVerification(@CurrentUser() user:User){
  if (!user) {
    throw new NotFoundException('User not found');
  }
await this.authService.generateEmailVerification(user.id)
return {status: 'success', message: 'sending email in a moment'}
}

@Post('verify/:otp')
@UseGuards(CurrentUserGuard)
async verifyEmail(@Param('otp') otp:string, @CurrentUser() user:User){
  if (!user) {
    throw new NotFoundException('User not found');
  }
  const result= await this.authService.verifyEmail(user.id,otp)

return {status:result ? 'success':'failure', message: null};
}


// email verification end


}