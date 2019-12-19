import { Test, TestingModule } from '@nestjs/testing';
import { ShareurlService } from './shareurl.service';
import { ApplePodcastsService } from './applepodcasts/applepodcasts.service';
import { BreakerService } from './breaker/breaker.service';
import { OvercastService } from './overcast/overcast.service';
import { PocketcastsService } from './pocketcasts/pocketcasts.service';
import { StitcherService } from './stitcher/stitcher.service';

describe('ShareurlService', () => {
  let service: ShareurlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareurlService,
        OvercastService,
        ApplePodcastsService,
        BreakerService,
        PocketcastsService,
        StitcherService,
      ],
    }).compile();

    service = module.get<ShareurlService>(ShareurlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
