import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { ArticleEntity } from '@app/article/article.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column()
  password: string;

  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles?: ArticleEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, +process.env.SALT_ROUNDS);
  }
}
