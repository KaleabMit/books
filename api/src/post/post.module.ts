import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CategoryModule } from '../category/category.module';
import { CsvModule } from 'src/csv/csv.module';
import { RecommendModule } from 'src/recommend/recommend.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => CategoryModule),
    CsvModule,RecommendModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, TypeOrmModule.forFeature([Post])],
})
export class PostModule {}
