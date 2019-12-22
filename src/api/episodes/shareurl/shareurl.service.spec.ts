import { Test, TestingModule } from '@nestjs/testing';
import { ShareurlService } from './shareurl.service';
import { ApplePodcastsService } from './applepodcasts/applepodcasts.service';
import { BreakerService } from './breaker/breaker.service';
import { OvercastService } from './overcast/overcast.service';
import { PocketcastsService } from './pocketcasts/pocketcasts.service';
import { StitcherService } from './stitcher/stitcher.service';
import { PodcastsModule } from 'src/api/podcasts/podcasts.module';
import { PodcastsService } from 'src/api/podcasts/podcasts.service';

jest.mock('src/api/podcasts/podcasts.module');
jest.mock('src/api/podcasts/podcasts.service');

describe('ShareurlService', () => {
  let service: ShareurlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PodcastsModule],
      providers: [
        ShareurlService,
        OvercastService,
        ApplePodcastsService,
        BreakerService,
        PocketcastsService,
        StitcherService,
        PodcastsService,
      ],
    }).compile();

    service = module.get<ShareurlService>(ShareurlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
