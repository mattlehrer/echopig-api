import { Schema, Document, model } from 'mongoose';
import { Post } from 'src/graphql.classes';
import { isURL } from 'validator';
import autopopulate = require('mongoose-autopopulate');
import * as stream from 'getstream-node';

function validateURL(url: string) {
  return isURL(url, {
    protocols: ['http', 'https'],
    // host_whitelist: [],
  });
}

interface PostDocument extends Post, Document {
  // Declaring everything that is not in the GraphQL Schema for a Post
  // byUser: ObjectId;
  guid: string;
  email: {
    fromAddress: string;
    subject: string;
    bodyHTML: string;
    bodyPlainText: string;
  };
}

const PostSchema: Schema = new Schema(
  {
    byUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: {
      fromAddress: String,
      subject: String,
      bodyHTML: String,
      bodyPlainText: String,
    },
    shareURL: {
      type: String,
      required: true,
      validate: { validator: validateURL },
    },
    comment: String,
    episode: {
      type: Schema.Types.ObjectId,
      ref: 'Episode',
      autopopulate: true,
      required: true,
    },
    guid: String,
    enabled: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
  },
);

PostSchema.plugin(autopopulate);

PostSchema.plugin(stream.mongoose.activity);
PostSchema.methods.activityActorProp = function() {
  return 'byUser';
};

const PostModel = model<PostDocument>('Post', PostSchema);

export { PostDocument, PostSchema, PostModel };
