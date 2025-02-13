import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/api/auth/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'src/api/auth/interfaces/jwt-payload.interface';
import { AuthenticationError } from 'apollo-server-core';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtSecret,
    });
  }

  // Documentation for this here: https://www.npmjs.com/package/passport-jwt
  async validate(payload: JwtPayload) {
    // This is called to validate the user in the token exists
    const user = await this.authService.validateJwtPayload(payload);

    if (!user) {
      throw new AuthenticationError(
        'Could not log-in with the provided credentials',
      );
    }

    return user;
  }
}
