import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';

interface Article extends Omit<ArticleEntity, 'author' | 'updateTimestamp'> {
  author: Omit<UserEntity, 'password' | 'hashPassword'>;
}

export interface ArticleResponse {
  article: Article;
}
