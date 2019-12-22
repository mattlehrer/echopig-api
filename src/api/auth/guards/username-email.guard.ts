import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { normalizeEmail } from 'validator';
// import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/graphql.classes';
// import { UsersService } from 'src/api/users/users.service';
import { AuthenticationError } from 'apollo-server-core';

// Check if username in field for query matches authenticated user's username
// or if the user is admin
@Injectable()
export class UsernameEmailGuard implements CanActivate {
  constructor() {}
  // constructor(private usersService: UsersService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    let shouldActivate = false;
    if (request.user) {
      const user = request.user as User;
      const args = ctx.getArgs();
      if (args.username && typeof args.username === 'string') {
        shouldActivate =
          args.username.toLowerCase() === user.username.toLowerCase();
      } else if (args.email && typeof args.email === 'string') {
        shouldActivate = normalizeEmail(args.email) === user.normalizedEmail;
      } else if (!args.username && !args.email) {
        shouldActivate = true;
      }
    }
    if (!shouldActivate) {
      throw new AuthenticationError('Could not authenticate with token');
    }
    return shouldActivate;
  }
}
