import { Exclude } from "class-transformer";
import { User } from "src/auth/entities/user.entity";
import { Category } from "src/category/entities/category.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Favorite } from "src/favorites/entities/favorite.entity";
import { Rating } from "src/rating/entities/rating.entity";
import { Recommendation } from "src/recommendation/entities/recommendation.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    title:string;
    @Column()
    author:string;
    @Column()
    photo:string;
    @Column()
    pdf: string;
    @Column()
    description:string;
    @Column()
    language:string;
    @Column()
    pages:number;
    @Column()
    @Column({type:'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    publishedOn:Date;

    // @Column()
    // @Exclude()
    // userId:number;

    @Column()
    @Exclude()
    categoryId:number;


    // @ManyToOne(()=>User,(user)=>user.posts,{eager:true})
    // @JoinColumn({
    //     name:'userId',
    //     referencedColumnName:'id'
    // })
    // user:User;

    @ManyToOne(()=>Category,(category)=>category.posts,{eager:true})
    @JoinColumn({
    name:'categoryId',
    referencedColumnName:'id'
})
    category:Category;

    @OneToMany(() => Rating, (rates) => rates.posts)
          rates: Rating[];

    @OneToMany(() => Recommendation, recommendations => recommendations.posts)
    recommendations: Recommendation;

    @OneToMany(() => Favorite, favorites => favorites.posts)
    favorites: Favorite;

}
