import { Schema, Document, model } from 'mongoose';
import autopopulate = require('mongoose-autopopulate');
import * as mongooseAlgolia from 'mongoose-algolia';
import { generate as generateId } from 'shortid';
import { Episode } from 'src/graphql.classes';
import { ConfigService } from 'src/config/config.service';

const configService = new ConfigService(`${process.env.NODE_ENV}.env`);

interface EpisodeDocument extends Episode, Document {
  // Declaring everything that is not in the GraphQL Schema for an Episode
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

EpisodeSchema.plugin(mongooseAlgolia, {
  appId: configService.algoliaAppId,
  apiKey: configService.algoliaApiKey,
  indexName: `${configService.env}_EPISODE`, //The name of the index in Algolia, you can also pass in a function
  selector: 'podcast title description', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  populate: {
    path: 'podcast',
    select: 'title -_id',
  },
  // defaults: {
  //   author: 'unknown',
  // },
  // mappings: {
  //   title: function(value) {
  //     return `Book: ${value}`;
  //   },
  // },
  // virtuals: {
  //   whatever: function(doc) {
  //     return `Custom data ${doc.title}`;
  //   },
  // },
  // filter: function(doc) {
  //   return !doc.softdelete;
  // },
  debug: configService.env === 'development', // Default: false -> If true operations are logged out in your console
});

const EpisodeModel = model<EpisodeDocument>('Episode', EpisodeSchema);

export { EpisodeDocument, EpisodeSchema, EpisodeModel };
