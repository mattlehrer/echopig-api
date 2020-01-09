import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [EmailModule, StreamModule],
})
export class UtilsModule {}
