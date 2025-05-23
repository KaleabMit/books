import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Category } from 'src/category/entities/category.entity';
import { CsvService } from 'src/csv/csv.service';
import { RecommendService } from 'src/recommend/recommend.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly csvService: CsvService,
    private readonly recommendService: RecommendService,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new BadRequestException('Category not found');

    const newPost = this.postRepo.create({
      ...dto,
      categoryId: category.id,
    });

    const savedPost = await this.postRepo.save(newPost);
    await this.handleSideEffects();

    return savedPost;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    await this.postRepo.update(id, dto);
    const updated = await this.postRepo.findOneBy({ id });
    if (!updated) throw new BadRequestException('Post not found after update');

    await this.handleSideEffects();
    return updated;
  }

  async remove(id: number): Promise<void> {
    const post = await this.postRepo.findOneBy({ id });
    if (!post) throw new BadRequestException('Post not found');

    await this.postRepo.remove(post);
    await this.handleSideEffects();
  }

  async findAll(query: any): Promise<Post[]> {
    return this.postRepo.find(query);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOneBy({ id });
    if (!post) throw new BadRequestException('Post not found');
    return post;
  }

  private async handleSideEffects(): Promise<void> {
    await this.updatePostsCsv();
    await this.retrainRecommendationModel();
  }

  private async updatePostsCsv(): Promise<void> {
    const posts = await this.postRepo.find();
    await this.csvService.writePostsCSV(posts);
  }

  private async retrainRecommendationModel(): Promise<void> {
    try {
      await this.recommendService.retrainModel();
      console.log('✅ Model retrained successfully!');
    } catch (err) {
      console.error('❌ Failed to retrain model:', err.message);
    }
  }
}
