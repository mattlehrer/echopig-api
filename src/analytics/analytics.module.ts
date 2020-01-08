import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SegmentService } from './segment/segment.service';

@Module({
  imports: [ConfigModule],
  providers: [SegmentService],
})
export class AnalyticsModule {}
