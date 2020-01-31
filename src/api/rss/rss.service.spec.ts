import { Test, TestingModule } from '@nestjs/testing';
import { RssService } from './rss.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { ConfigModule } from 'src/config/config.module';

describe('RssService', () => {
  let service: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, PostsModule, ConfigModule],
      providers: [RssService],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
