import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { ObjectId } from 'src/graphql.classes';
import { InjectModel } from '@nestjs/mongoose';
import { FollowDocument } from './schemas/follow.schema';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel('Follow')
    private readonly followModel: Model<FollowDocument>,
  ) {}

  async findOrCreate(
    user: UserDocument,
    target: UserDocument,
  ): Promise<FollowDocument> {
    // check for existing episode with this shareURL
    let follow: FollowDocument | null = await this.followModel.findOne({
      user,
      target,
    });
    if (!follow) {
      const createdFollow = new this.followModel({
        user,
        target,
      });
      try {
        follow = await createdFollow.save();
        Logger.log('Created new follow', FollowsService.name);
        Logger.log(follow, FollowsService.name);
      } catch (error) {
        throw new MongoError(error);
      }
    }

    return follow;
  }

  async getAllFollowsOfUser(user: ObjectId): Promise<FollowDocument[]> {
    return await this.followModel.find({ user });
  }
}
