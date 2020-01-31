import { Injectable, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { isURL } from 'validator';
import { EmailService } from 'src/utils/email/email.service';
import { PostsService } from '../posts.service';
import { UsersService } from 'src/api/users/users.service';
import { CreatePostInput } from 'src/graphql.classes';

@Injectable()
export class MailpostService {
  constructor(
    // @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    private postsService: PostsService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async parseEmail(emailData): Promise<CreatePostInput | null> {
    let shareURL: string;
    const strippedText: string = emailData['stripped-text'];
    Logger.debug(strippedText);
    try {
      shareURL = strippedText
        .trim()
        .slice(strippedText.indexOf('http'))
        .split(/\s/)[0]
        .trim();
      if (!isURL(shareURL)) {
        Logger.warn(
          `received post from mailgun, but without a share URL: ${strippedText}`,
          MailpostService.name,
        );
        return null;
      }
    } catch (error) {
      Logger.warn(
        `ERROR: received post from mailgun, but without a share URL: ${strippedText}`,
        MailpostService.name,
      );
      return null;
    }
    const tag = emailData.To.split('@')[0].split('+')[1];
    const user = await this.usersService.findOneByTag(tag);
    if (!user) {
      Logger.log(
        `ERROR: received post from mailgun, but without a user matching the tag ${tag}`,
      );
      return null;
    }
    const createPostInput: CreatePostInput = {
      byUser: user,
      shareURL: shareURL,
      enabled: true,
    };
    Logger.debug('successfully parsed');
    Logger.debug(createPostInput);
    return createPostInput;
  }

  async postMailPost({
    token,
    timestamp,
    signature,
    ...emailData
  }): Promise<number> {
    if (!this.emailService.confirmSignature({ token, timestamp, signature }))
      throw new HttpException('Unauthorized', HttpStatus.NOT_ACCEPTABLE);

    const createPostInput = await this.parseEmail(emailData);
    if (!createPostInput)
      throw new HttpException('Bad Request', HttpStatus.NOT_ACCEPTABLE);
    const post = await this.postsService.create(createPostInput);
    if (post) return HttpStatus.OK;
    throw new HttpException('Internal Server Error', HttpStatus.NOT_ACCEPTABLE);
  }
}
