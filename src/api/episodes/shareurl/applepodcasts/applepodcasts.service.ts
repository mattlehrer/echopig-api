import { Injectable } from '@nestjs/common';
import { EpisodeInputData } from 'src/api/types/inputs';

@Injectable()
export class ApplePodcastsService {
  async parse(url: string): Promise<EpisodeInputData> {
    let episodeData;

    return episodeData;
  }
}
