import { Scalar } from '@nestjs/graphql';
import { Kind, ASTNode } from 'graphql';
import { Types } from 'mongoose';
import { isValid } from 'shortid';

@Scalar('ObjectId')
export class ObjectIdScalar {
  description = 'MongoDB ObjectId scalar type, sent as 24 byte Hex String';

  parseValue(value: string) {
    try {
      return new Types.ObjectId(value); // value from the client
    } catch (e) {
      if (isValid(value)) return value;
      throw e;
    }
  }

  serialize(value: Types.ObjectId) {
    return Types.ObjectId.isValid(value) ? value.toHexString() : value;
  }

  parseLiteral(ast: ASTNode) {
    if (ast.kind === Kind.STRING) {
      return new Types.ObjectId(ast.value); // ast value is always in string format
    }
    return null;
  }
}
