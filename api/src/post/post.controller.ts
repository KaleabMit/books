import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, 
  UseInterceptors, ClassSerializerInterceptor, Req, Query, UseGuards, 
  UploadedFile, BadRequestException, Res, ValidationPipe 
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/auth/entities/user.entity';
import { CategoryService } from 'src/category/category.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/user.decorator';
import { CurrentUserGuard } from 'src/auth/current-user.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ACGuard, UseRoles } from 'nest-access-control';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly categoryService: CategoryService
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    possession: 'any',
    action: 'create',
    resource: 'posts',
  })
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @UseGuards(CurrentUserGuard)
  findAll(@Query() query: any, @Req() req: Request, @CurrentUser() user: User) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExtension = file.originalname.split('.')[1];
        const newFileName = `${name.split('').join('_')}_${Date.now()}.${fileExtension}`;
        cb(null, newFileName);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
        return cb(null, false);
      }
      cb(null, true);
    }
  }))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not an image.');
    } else {
      const response = {
        filepath: `http://localhost:5000/posts/pictures/${file.filename}`,
      };
      return response;
    }
  }

  @Get('pictures/:filename')
  async getPicture(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `./uploads/${filename}`;
    res.sendFile(filePath, { root: '.' });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    possession: 'any',
    action: 'update',
    resource: 'posts',
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }
  
  @Delete(':id')
@UseGuards(AuthGuard('jwt'), ACGuard)
@UseRoles({
  possession: 'any',
  action: 'delete',
  resource: 'posts',
})
async remove(@Param('id') id: string) {
  try {
    const post = await this.postService.findOne(+id);  

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    await this.postService.remove(+id); 
    return { success: true, message: 'Post deleted' };
  } catch (error) {
    return { success: false, message: 'An error occurred while deleting the post' };
  }
}


}
