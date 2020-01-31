import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserModel } from 'src/api/users/schemas/user.schema';
import { UsersService } from 'src/api/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';

jest.mock('src/api/users/users.service');
jest.mock('src/config/config.service');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.jwtSecret,
            signOptions: {
              expiresIn: configService.jwtExpiresIn,
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: UserModel,
        },
        ConfigService,
        // {
        //   provide: ConfigService,
        //   useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
        // },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
