import { Test, TestingModule } from '@nestjs/testing';
import { PodcastsService } from './podcasts.service';
import { PodcastModel } from './schemas/podcast.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('PodcastsService', () => {
  let service: PodcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastsService,
        {
          provide: getModelToken('Podcast'),
          useValue: PodcastModel,
        },
      ],
    }).compile();

    service = module.get<PodcastsService>(PodcastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
