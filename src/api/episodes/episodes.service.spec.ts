import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EpisodeModel } from './schemas/episode.schema';
import { EpisodesService } from './episodes.service';
import { ShareurlService } from './shareurl/shareurl.service';
import { PodcastsService } from '../podcasts/podcasts.service';

jest.mock('./shareurl/shareurl.service');
// jest.mock('../podcasts/podcasts.service');

describe('EpisodesService', () => {
  let service: EpisodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodesService,
        {
          provide: getModelToken('Episode'),
          useValue: EpisodeModel,
        },
        PodcastsService,
        ShareurlService,
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
