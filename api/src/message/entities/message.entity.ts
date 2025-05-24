import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstname: string;
  
    @Column()
    lastname: string;
  
    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    message:string;

    @Column({type:'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    createdon:Date;
}
