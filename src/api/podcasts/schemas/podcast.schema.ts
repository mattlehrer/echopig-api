import { Schema, Document, model } from 'mongoose';
import * as mongooseAlgolia from 'mongoose-algolia';
import { Podcast } from 'src/graphql.classes';
import { ConfigService } from 'src/config/config.service';

const configService = new ConfigService(`${process.env.NODE_ENV}.env`);

export interface PodcastDocument extends Podcast, Document {
  // Declaring everything that is not in the GraphQL Schema for a Post
  // field: string;
}

export const PodcastSchema: Schema = new Schema(
  {
    iTunesID: { type: Number, alias: 'collectionId', unique: true },
    author: { type: String, alias: 'artistName' },
    title: { type: String, alias: 'collectionName' },
    iTunesURL: { type: String, alias: 'collectionViewUrl' },
    feedUrl: String,
    artworkUrl30: String,
    artworkUrl60: String,
    artworkUrl100: String,
    collectionExplicitness: String,
    trackExplicitness: String,
    country: String,
    primaryGenreName: String,
    contentAdvisoryRating: String,
    artworkUrl600: String,
    genreIds: [Number],
    genres: [String],
    listenNotesID: String,
    appURLs: [String],
  },
  {
    timestamps: true,
  },
);

PodcastSchema.plugin(mongooseAlgolia, {
  appId: configService.algoliaAppId,
  apiKey: configService.algoliaApiKey,
  indexName: `${configService.env}_PODCAST`, //The name of the index in Algolia, you can also pass in a function
  selector: 'title genres', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  // populate: {
  //   path: 'podcast',
  //   select: 'title -_id',
  // },
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

export const PodcastModel = model<PodcastDocument>('Podcast', PodcastSchema);
