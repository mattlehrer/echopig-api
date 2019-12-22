import { Schema, Document, model } from 'mongoose';
import { Podcast } from 'src/graphql.classes';

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

export const PodcastModel = model<PodcastDocument>('Podcast', PodcastSchema);
