import { Test, TestingModule } from '@nestjs/testing';
import { BreakerService } from './breaker.service';

describe('BreakerService', () => {
  let service: BreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BreakerService],
    }).compile();

    service = module.get<BreakerService>(BreakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
