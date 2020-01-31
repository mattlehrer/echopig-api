import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-core';

@Injectable()
// In order to use AuthGuard together with GraphQL, you have to extend
// the built-in AuthGuard class and override getRequest() method.
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any) {
    if (info) Logger.debug(`info: ${info}`, JwtAuthGuard.name);
    if (err || !user) {
      throw err || new AuthenticationError('Could not authenticate with token');
    }
    return user;
  }
}
