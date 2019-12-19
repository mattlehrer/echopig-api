import { Test, TestingModule } from '@nestjs/testing';
import { OvercastService } from './overcast.service';

describe('OvercastService', () => {
  let service: OvercastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OvercastService],
    }).compile();

    service = module.get<OvercastService>(OvercastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
