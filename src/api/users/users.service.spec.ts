import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserModel } from './schemas/user.schema';
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/api/auth/auth.service';

jest.mock('../auth/auth.service');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: UserModel,
        },
        ConfigService,
        {
          provide: ConfigService,
          useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
        },
        AuthService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
