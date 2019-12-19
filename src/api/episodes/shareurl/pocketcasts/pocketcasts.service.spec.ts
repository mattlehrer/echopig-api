import { Test, TestingModule } from '@nestjs/testing';
import { PocketcastsService } from './pocketcasts.service';

describe('PocketcastsService', () => {
  let service: PocketcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PocketcastsService],
    }).compile();

    service = module.get<PocketcastsService>(PocketcastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
