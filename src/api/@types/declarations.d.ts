import { Request } from 'express';
import { ObjectId } from 'src/graphql.classes';
import { UserDocument } from 'src/api/users/schemas/user.schema';

export interface RequestWithUser extends Request {
  user: UserDocument | ObjectId;
}

export interface ObjectIdPair {
  _id: ObjectId;
  byUser: ObjectId;
}
