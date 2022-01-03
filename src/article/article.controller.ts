import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';

import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/createArticle.dto';
import { ArticleResponse } from '@app/article/types/articleResponse';
import { ArticlesResponse } from '@app/article/types/articlesResponse';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() query: QueryParams,
  ): Promise<ArticlesResponse> {
    return this.articleService.findAll(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async geArticle(@Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') userId: number,
  ): Promise<DeleteResult> {
    return this.articleService.deleteArticle(slug, userId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') userId: number,
    @Body('article') updateArticleDto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.deleteArticleToFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
