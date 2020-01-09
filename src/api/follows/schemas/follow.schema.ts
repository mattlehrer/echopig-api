import { Schema, Document, model } from 'mongoose';
// import { Post } from 'src/graphql.classes';
import * as stream from 'getstream-node';
import { UserDocument } from 'src/api/users/schemas/user.schema';

interface FollowDocument extends Document {
  user: UserDocument;
  target: UserDocument;
}

const FollowSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    target: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

FollowSchema.plugin(stream.mongoose.activity);

// FollowSchema.methods.activityNotify = function() {
//   const targetFeed = stream.FeedManager.getNotificationFeed(this.target._id);
//   return [targetFeed];
// };

FollowSchema.methods.activityForeignId = function() {
  return this.user._id + ':' + this.target._id;
};

FollowSchema.statics.pathsToPopulate = function() {
  return ['user', 'target'];
};

FollowSchema.post('save', function(doc: any) {
  if (doc.wasNew) {
    const userId = doc.user._id || doc.user;
    const targetId = doc.target._id || doc.target;
    stream.FeedManager.followUser(userId, targetId);
  }
});

FollowSchema.post('remove', function(doc: any) {
  stream.FeedManager.unfollowUser(doc.user, doc.target);
});

const FollowModel = model('Follow', FollowSchema);

export { FollowSchema, FollowModel, FollowDocument };
