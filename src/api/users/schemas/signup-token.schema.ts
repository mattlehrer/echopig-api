import { Schema, model } from 'mongoose';

export const SignUpTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  valid: { type: Date, required: true, default: Date.now, expires: '1d' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const PasswordResetTokenModel = model('SignUpToken', SignUpTokenSchema);
