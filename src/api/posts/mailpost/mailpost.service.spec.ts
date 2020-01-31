import { Test, TestingModule } from '@nestjs/testing';
import { MailpostService } from './mailpost.service';

describe('MailpostService', () => {
  let service: MailpostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailpostService],
    }).compile();

    service = module.get<MailpostService>(MailpostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
