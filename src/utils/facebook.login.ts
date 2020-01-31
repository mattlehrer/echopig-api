import axios from 'axios';
import { Logger } from '@nestjs/common';

export async function isValidFbToken(
  token,
  fbAppToken,
  fbAppId,
): Promise<boolean> {
  Logger.debug(`verifying fb token`, isValidFbToken.name);
  const { data } = await axios.get(
    `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${fbAppToken}`,
  );
  Logger.debug(data, isValidFbToken.name);
  if (!data.data.is_valid || data.data.app_id !== fbAppId) return false;
  return true;
}

export async function getFbProfile(id, token): Promise<any> {
  const response = await axios.get(
    `https://graph.facebook.com/${id}?fields=name,picture,email&access_token=${token}`,
  );
  // Logger.debug(response);
  if (response.data.error) {
    Logger.error(
      response.data.error,
      `${isValidFbToken.name} on profile ${id}`,
    );
  } else {
    Logger.debug(response.data);
    return {
      email: response.data.email,
      name: response.data.name,
      avatar: response.data.picture.data.url,
    };
  }
}
