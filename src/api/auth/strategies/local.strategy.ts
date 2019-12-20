import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginResult } from 'src/graphql.classes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<LoginResult> {
    const user = await this.authService.validateUserByPassword({
      username,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
