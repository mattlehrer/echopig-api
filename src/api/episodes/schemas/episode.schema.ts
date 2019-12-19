import { Schema, Document, model } from 'mongoose';
import * as autopopulate from 'mongoose-autopopulate';
import { generate as generateId } from 'shortid';
import { Episode } from '../../../graphql.classes';

interface EpisodeDocument extends Episode, Document {
  // Declaring everything that is not in the GraphQL Schema for a Post
  // field: string;
  mp3RedirectChain: string[];
}

const EpisodeSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: generateId,
    },
    podcast: {
      type: Schema.Types.ObjectId,
      ref: 'Podcast',
      autopopulate: true,
    },
    title: String,
    description: String,
    image: String,
    mp3URL: String,
    mp3RedirectChain: [String],
    releaseDate: Date,
    shareURLs: [String],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    // saves: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Save',
    //   },
    // ],
    duration: Number, // in seconds
    parentalRating: String,
    // ratingRiaa: Number,
    listenNotesID: String,
  },
  {
    timestamps: true,
  },
);

EpisodeSchema.plugin(autopopulate);

const EpisodeModel = model<EpisodeDocument>('Episode', EpisodeSchema);

export { EpisodeDocument, EpisodeSchema, EpisodeModel };
