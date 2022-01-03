import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';

import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleResponse } from '@app/article/types/articleResponse';
import { ArticlesResponse } from '@app/article/types/articlesResponse';

@Injectable()
export class ArticleService {
  static getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '_' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(userId: number, query: QueryParams): Promise<ArticlesResponse> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });

      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList = :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          username: query.favorited,
        },
        { relations: ['favorites'] },
      );

      const ids = author.favorites.map((a) => a.id);

      if (ids.length) {
        queryBuilder.andWhere('articles.author IN (:...ids)', {
          ids,
        });
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();

    return {
      articles,
      articlesCount,
    };
  }

  async createArticle(
    author: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = this.articleRepository.create({
      author,
      ...createArticleDto,
      slug: ArticleService.getSlug(createArticleDto.title),
    });

    return await this.articleRepository.save(article);
  }

  async deleteArticle(slug: string, userId: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    await this.articleRepository.update(article.id, updateArticleDto);

    return await this.findBySlug(slug);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  async addArticleToFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });

    const isNotFavorited = !user.favorites.find((f) => f.id === article.id);

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleToFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex((f) => f.id === article.id);

    if (articleIndex !== -1) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponse {
    const {
      author: { id, username, email, bio, image, favorites },
      ...rest
    } = article;

    return {
      article: {
        ...rest,
        author: { id, username, email, bio, image, favorites },
      },
    };
  }
}
