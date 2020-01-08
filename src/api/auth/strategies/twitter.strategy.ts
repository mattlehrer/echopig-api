import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-twitter';
import { PassportStrategy } from '@nestjs/passport';
import { AuthenticationError } from 'apollo-server-core';
import { ConfigService } from 'src/config/config.service';
import { UsersService } from 'src/api/users/users.service';
import { UserDocument } from 'src/api/users/schemas/user.schema';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      consumerKey: configService.twitterConsumerKey,
      consumerSecret: configService.twitterConsumerSecret,
      callbackURL: '/auth/twitter/callback',
      passReqToCallback: true,
      proxy: true,
      includeEmail: true,
    });
  }

  async validate(req, accessToken: string, tokenSecret: string, profile, done) {
    if (req.user) {
      let existingUser: UserDocument;
      try {
        existingUser = await this.usersService.findOneByTwitterId(profile.id);
      } catch (err) {
        Logger.error(
          `TwitterStrategy find by twitter error for user: ${req.user.username}`,
        );
        throw new AuthenticationError(err.message);
      }
      if (existingUser) return existingUser;
      let user: UserDocument;
      try {
        user = await this.usersService.findOneById(req.user.id);
        user.set('twitter', profile.id);
        user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
        user.set('name', user.name || profile.displayName);
        user.set(
          'avatar',
          user.avatar || profile._json.profile_image_url_https,
        );
        await user.save();
      } catch (err) {
        throw err;
      }
      Logger.log(`Updated user ${user._id} with twitter id`);
      // @TODO: flash messages?
      // req.flash('info', 'Twitter account has been linked.');
      return user;
    } else {
      let existingUser: UserDocument;
      try {
        existingUser = await this.usersService.findOneByTwitterId(profile.id);
      } catch (err) {
        Logger.error(
          `TwitterStrategy find by twitter error for new user: ${req.user.username}`,
        );
        throw new AuthenticationError(err.message);
      }
      if (existingUser) return existingUser;
      // put profile in our User format
      const newUser = {
        // temp username
        username: `temp{${profile.id}}twitter`,
        email: profile.emails[0].value,
        twitter: profile.id,
        tokens: [{ kind: 'twitter', accessToken, tokenSecret }],
        name: profile.displayName,
        avatar: profile._json.profile_image_url_https,
      };
      // no twitter profile id found, now check for existing user with that email
      // if twitter gave us an email address
      if (newUser.email) {
        try {
          existingUser = await this.usersService.findOneByEmail(newUser.email);
        } catch (err) {
          throw err;
        }

        if (existingUser) {
          existingUser.set({ twitter: profile.id });
          existingUser.tokens.push({
            kind: 'twitter',
            accessToken,
            tokenSecret,
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
          Logger.log(`Created user on Twitter login: ${JSON.stringify(user)}`);
          return user;
        }
      } else {
        let user: UserDocument;
        try {
          user = await this.usersService.create(newUser);
        } catch (err) {
          throw err;
        }
        Logger.log(`Created user on Twitter login: ${JSON.stringify(user)}`);
        return user;
      }
    }
  }
}
