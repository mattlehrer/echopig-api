import { Test, TestingModule } from '@nestjs/testing';
import { ApplePodcastsService } from './applepodcasts.service';

describe('ApplepodcastsService', () => {
  let service: ApplePodcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplePodcastsService],
    }).compile();

    service = module.get<ApplePodcastsService>(ApplePodcastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
