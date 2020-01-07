import { Test, TestingModule } from '@nestjs/testing';
import { MailPostController } from './mailpost.controller';

describe('Posts Controller', () => {
  let controller: MailPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailPostController],
    }).compile();

    controller = module.get<MailPostController>(MailPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
