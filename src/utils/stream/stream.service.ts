import { Injectable, OnModuleInit } from '@nestjs/common';
import * as stream from 'getstream-node';
import * as mongoose from 'mongoose';

@Injectable()
export class StreamService implements OnModuleInit {
  onModuleInit() {
    stream.mongoose.setupMongoose(mongoose);
  }
}
