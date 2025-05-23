import { Post } from 'src/post/entities/post.entity';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRoles } from '../user-roles';
import { Reply } from 'src/reply/entities/reply.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Recommendation } from 'src/recommendation/entities/recommendation.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Bookclub } from 'src/bookclub/entities/bookclub.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: null })
  photo: string;

  @Column({ default: null })
  bio: string;

  @Column({ default: null })
  telegram: string;

  @Column({ default: null })
  instagram: string;

  @Column({ default: null })
  linkedin: string;
  
  @Column({ default: null })
  twitter: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.Reader,
  })
  roles: UserRoles;

  @Column({ default: false })
  isVerified: boolean;
  
  @Column({ default: 'inactive' })
  accountStatus: 'active' | 'inactive';

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @OneToMany(() => Comment, (comments) => comments.user)
    comments: Comment[];

  @OneToMany(() => Bookclub, (bookclub) => bookclub.user)
  bookclub: Bookclub[];


  @OneToMany(() => Rating, (rates) => rates.user)
            rates: Rating;

  // @OneToMany(() => Post, (post) => post.user)
  // posts: Post[];

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply;

    
  @OneToMany(() => Recommendation, recommendations => recommendations.user)
  recommendations: Recommendation;

  @OneToMany(() => Favorite, favorites => favorites.user)
  favorites: Favorite;

  @OneToMany(() => Notification, notifications => notifications.user)
  notifications: Notification;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
