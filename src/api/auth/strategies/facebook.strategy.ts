import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-facebook';
import { PassportStrategy } from '@nestjs/passport';
import { AuthenticationError } from 'apollo-server-core';
import { ConfigService } from 'src/config/config.service';
import { UsersService } from 'src/api/users/users.service';
import { UserDocument } from 'src/api/users/schemas/user.schema';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.fbAppId,
      clientSecret: configService.fbAppSecret,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
      passReqToCallback: true,
    });
  }

  async validate(req, accessToken: string, refreshToken: string, profile) {
    if (req.user) {
      let existingUser: UserDocument;
      try {
        existingUser = await this.usersService.findOneByFbId(profile.id);
      } catch (err) {
        Logger.error(
          `FacebookStrategy find by facebook error for user: ${req.user}`,
        );
        throw new AuthenticationError(err.message);
      }
      if (existingUser) return existingUser;
      let user: UserDocument;
      try {
        user = await this.usersService.findOneById(req.user.id);
        user.set('facebook', profile.id);
        user.tokens.push({ kind: 'facebook', accessToken, refreshToken });
        user.set('name', user.name || profile.displayName);
        user.set(
          'avatar',
          user.avatar || profile._json.profile_image_url_https,
        );
        await user.save();
      } catch (err) {
        throw err;
      }
      Logger.log(`Updated user ${user._id} with facebook id`);
      // @TODO: flash messages?
      // req.flash('info', 'Facebook account has been linked.');
      return user;
    } else {
      let existingUser: UserDocument;
      try {
        existingUser = await this.usersService.findOneByFbId(profile.id);
      } catch (err) {
        Logger.error(
          `FacebookStrategy find by facebook id error for new user: ${req.user}`,
        );
        throw new AuthenticationError(err.message);
      }
      if (existingUser) return existingUser;
      // put profile in our User format
      const newUser = {
        // temp username
        username: `temp{${profile.id}}facebook`,
        email: profile.emails[0].value,
        facebook: profile.id,
        tokens: [{ kind: 'facebook', accessToken, refreshToken }],
        name: profile.displayName,
        avatar: profile._json.profile_image_url_https,
      };
      // no facebook profile id found, now check for existing user with that email
      // if facebook gave us an email address
      if (newUser.email) {
        try {
          existingUser = await this.usersService.findOneByEmail(newUser.email);
        } catch (err) {
          throw err;
        }

        if (existingUser) {
          existingUser.set({ facebook: profile.id });
          existingUser.tokens.push({
            kind: 'facebook',
            accessToken,
            refreshToken,
          });
          existingUser.set({ name: profile.displayName });
          if (!existingUser.avatar) {
            existingUser.set({
              avatar: profile._json.profile_image_url_https,
            });
          }
          try {
            await existingUser.save();
          } catch (err) {
            throw err;
          }
          return existingUser;
        } else {
          // no existing accout with that email found
          let user: UserDocument;
          try {
            user = await this.usersService.create(newUser);
          } catch (err) {
            throw err;
          }
          return user;
        }
      } else {
        let user: UserDocument;
        try {
          user = await this.usersService.create(newUser);
        } catch (err) {
          throw err;
        }
        return user;
      }
    }
  }
}
