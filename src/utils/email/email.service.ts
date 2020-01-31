import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as path from 'path';
import * as Email from 'email-templates';
import * as mg from 'nodemailer-mailgun-transport';
import * as Mailgun from 'mailgun-js';
import { isEmail } from 'validator';
import { ConfigService } from 'src/config/config.service';
import { InjectEventEmitter } from 'nest-emitter';
import { UserEventEmitter } from 'src/api/users/users.events';

@Injectable()
export class EmailService implements OnModuleInit {
  private mailgun: any;
  constructor(
    private configService: ConfigService,
    @InjectEventEmitter() private readonly userEventEmitter: UserEventEmitter,
  ) {}
  onModuleInit() {
    this.userEventEmitter.on('newUser', async user => {
      Logger.debug(`User event! New user ${user.username}`, EmailService.name);
      await this.addToList({ user });
    });
    // this.userEventEmitter.on('updatedUser', async user => {
    //   Logger.debug(
    //     `User event! Updated user ${user.username}`,
    //     RssService.name,
    //   );
    //   await this.updateAndCacheFeed({ user });
    // });
    this.mailgun = Mailgun({
      apiKey: this.configService.mgApiKey,
      domain: this.configService.mgDomain,
      testMode: this.configService.env !== 'production',
    });
  }

  async sendWithTemplate({
    template,
    to,
    from = `info@${this.configService.mgDomain}`,
    variables = {},
  }): Promise<boolean> {
    const mgParams = {
      auth: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        api_key: this.configService.mgApiKey,
        domain: this.configService.mgDomain,
      },
    };
    const email = new Email({
      views: {
        root: path.resolve('src/utils/email/templates'),
      },
      message: {
        from,
      },
      // uncomment below to send emails in development/test env:
      // send: true,
      transport: createTransport(mg(mgParams)),
    });
    if (!to.email || !isEmail(to.email)) {
      Logger.error(`Invalid email: ${to.email}`, EmailService.name);
      throw new Error('Invalid email address');
    }
    email
      .send({
        template,
        message: {
          to: { name: `${to.name || ''}`, address: to.email },
          // mailgun tag for email analytics
          // 'o:tag': [`${template}`],
        },
        locals: {
          baseUrl: this.configService.baseUrl,
          ...variables,
        },
      })
      .then((res: any) => {
        Logger.log(res, EmailService.name);
        return true;
      })
      .catch((err: Error) => {
        Logger.debug('received error', EmailService.name);
        Logger.error(err);
        // Logger.error(err, EmailService.name);
        throw new Error(err.message);
      });
    return false;
  }

  async addToList({ user, listName = 'users' }): Promise<void> {
    const list = this.mailgun.lists(
      `${listName}@${this.configService.mgDomain}`,
    );

    const member = {
      subscribed: true,
      address: user.email,
      name: user.name || '',
      upsert: 'yes',
    };

    const res = await list.members().create(member);
    Logger.debug(`Added new user to email list: ${res}`, EmailService.name);
    return null;
  }

  async confirmSignature({
    token = '',
    timestamp = '',
    signature = '',
  }): Promise<boolean> {
    return await this.mailgun.validateWebhook(timestamp, token, signature);
  }
}
