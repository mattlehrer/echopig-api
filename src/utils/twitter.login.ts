/* eslint-disable @typescript-eslint/camelcase */
import * as request from 'request-promise-native';
import { Logger } from '@nestjs/common';

export async function getTwitterProfile(oauth): Promise<any> {
  const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  try {
    const user = await request.get({
      url,
      oauth,
      qs: { include_email: true },
      json: true,
    });
    const { profile_image_url_https, name, id_str, email } = user;
    return {
      avatar: profile_image_url_https,
      name,
      id: id_str,
      email,
    };
  } catch (e) {
    Logger.error(e);
    throw e;
  }
}
