import { Module } from '@nestjs/common';
import { ShareurlService } from './shareurl.service';
import { OvercastService } from './overcast/overcast.service';
import { ApplePodcastsService } from './applepodcasts/applepodcasts.service';
import { BreakerService } from './breaker/breaker.service';
import { PocketcastsService } from './pocketcasts/pocketcasts.service';
import { StitcherService } from './stitcher/stitcher.service';
import { PodcastsModule } from 'src/api/podcasts/podcasts.module';

@Module({
  imports: [PodcastsModule],
  providers: [
    ShareurlService,
    OvercastService,
    ApplePodcastsService,
    BreakerService,
    PocketcastsService,
    StitcherService,
  ],
  exports: [ShareurlService],
})
export class ShareurlModule {}
