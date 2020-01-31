import { Test, TestingModule } from '@nestjs/testing';
import { StitcherService } from './stitcher.service';

describe('StitcherService', () => {
  let service: StitcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StitcherService],
    }).compile();

    service = module.get<StitcherService>(StitcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
