import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  findAll(): string[] {
    return ['tag 1', 'tag 2', 'tag 3'];
  }
}
