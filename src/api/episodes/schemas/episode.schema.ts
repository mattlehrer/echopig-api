import { Schema, Document, model } from 'mongoose';
import autopopulate = require('mongoose-autopopulate');
import { generate as generateId } from 'shortid';
import { Episode, ObjectId } from 'src/graphql.classes';

interface EpisodeDocument extends Episode, Document {
  // Declaring everything that is not in the GraphQL Schema for a Post
  // field: string;
  podcast: ObjectId;
  posts: ObjectId[];
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
