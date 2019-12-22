import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostModel } from './schemas/post.schema';
import { UsersService } from 'src/api/users/users.service';
// import { UserModel } from 'src/api/users/schemas/user.schema';
// import { ConfigService } from 'src/config/config.service';

jest.mock('../users/users.service');

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken('Post'),
          useValue: PostModel,
        },
        UsersService,
        // { provide: getModelToken('User'), useValue: UserModel },
        // ConfigService,
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
