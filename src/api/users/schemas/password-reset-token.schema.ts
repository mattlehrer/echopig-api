import { Schema, model } from 'mongoose';

export const PasswordResetTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  valid: { type: Date, required: true, default: Date.now, expires: '4h' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const PasswordResetTokenModel = model(
  'PasswordResetToken',
  PasswordResetTokenSchema,
);
