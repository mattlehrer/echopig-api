import { Controller, Post, Body } from '@nestjs/common';
import { MailpostService } from './mailpost.service';

@Controller('mailpost')
export class MailPostController {
  constructor(private mailpostService: MailpostService) {}

  @Post()
  async postMailPost(@Body() data): Promise<number> {
    return await this.mailpostService.postMailPost(data);
  }
}
