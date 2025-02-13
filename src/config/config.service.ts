import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

export interface EnvConfig {
  [key: string]: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;
  private readonly environment: string;

  constructor(filePath: string) {
    let file: Buffer | undefined;
    try {
      file = fs.readFileSync(filePath);
    } catch (error) {
      file = fs.readFileSync('development.env');
    }

    const config = dotenv.parse(file);
    this.envConfig = this.validateInput(config);
    this.environment = process.env.NODE_ENV || 'development';
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      BASE_URL: Joi.string().required(),
      MONGO_URI: Joi.string().required(),
      MONGO_AUTH_ENABLED: Joi.boolean().default(false),
      MONGO_USER: Joi.string().when('MONGO_AUTH_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      MONGO_PASSWORD: Joi.string().when('MONGO_AUTH_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      IMAGES_URL: Joi.string().default('http://localhost:3000/images/'),
      JWT_SECRET: Joi.string().required(),
      JWT_EXPIRES_IN: Joi.number(),
      EMAIL_ENABLED: Joi.boolean().default(false),
      EMAIL_SERVICE: Joi.string().when('EMAIL_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      EMAIL_USERNAME: Joi.string().when('EMAIL_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      EMAIL_PASSWORD: Joi.string().when('EMAIL_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      EMAIL_FROM: Joi.string().when('EMAIL_ENABLED', {
        is: true,
        then: Joi.required(),
      }),
      TEST_EMAIL_TO: Joi.string(),
      AWS_ACCESS_KEY_ID: Joi.string(),
      AWS_SECRET_ACCESS_KEY: Joi.string(),
      AWS_S3_BUCKET: Joi.string(),
      MAILGUN_API_KEY: Joi.string(),
      MAILGUN_DOMAIN: Joi.string(),
      TWITTER_CONSUMER_KEY: Joi.string(),
      TWITTER_CONSUMER_SECRET: Joi.string(),
      FACEBOOK_APP_ID: Joi.string(),
      FACEBOOK_APP_SECRET: Joi.string(),
      FACEBOOK_APP_TOKEN: Joi.string(),
      SEGMENT_KEY: Joi.string(),
      STREAM_KEY: Joi.string(),
      STREAM_SECRET: Joi.string(),
      STREAM_APP_ID: Joi.string(),
      ALGOLIA_APP_ID: Joi.string(),
      ALGOLIA_API_KEY: Joi.string(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(
        `Config validation error in your env file: ${error.message}`,
      );
    }
    return validatedEnvConfig;
  }

  get env(): string {
    return this.environment;
  }

  get jwtExpiresIn(): number | undefined {
    if (this.envConfig.JWT_EXPIRES_IN) {
      return +this.envConfig.JWT_EXPIRES_IN;
    }
    return undefined;
  }

  get mongoUri(): string {
    return this.envConfig.MONGO_URI;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get imagesUrl(): string {
    return this.envConfig.IMAGES_URL;
  }

  get emailService(): string | undefined {
    return this.envConfig.EMAIL_SERVICE;
  }

  get mgApiKey(): string | undefined {
    return this.envConfig.MAILGUN_API_KEY;
  }

  get mgDomain(): string | undefined {
    return this.envConfig.MAILGUN_DOMAIN;
  }

  get baseUrl(): string | undefined {
    return this.envConfig.BASE_URL;
  }

  get emailUsername(): string | undefined {
    return this.envConfig.EMAIL_USERNAME;
  }

  get emailPassword(): string | undefined {
    return this.envConfig.EMAIL_PASSWORD;
  }

  get emailFrom(): string | undefined {
    return this.envConfig.EMAIL_FROM;
  }

  get testEmailTo(): string | undefined {
    return this.envConfig.TEST_EMAIL_TO;
  }

  get mongoUser(): string | undefined {
    return this.envConfig.MONGO_USER;
  }

  get mongoPassword(): string | undefined {
    return this.envConfig.MONGO_PASSWORD;
  }

  get emailEnabled(): boolean {
    return Boolean(this.envConfig.EMAIL_ENABLED).valueOf();
  }

  get mongoAuthEnabled(): boolean {
    return Boolean(this.envConfig.MONGO_AUTH_ENABLED).valueOf();
  }

  get awsAccessKeyId(): string | undefined {
    return this.envConfig.AWS_ACCESS_KEY_ID;
  }

  get awsSecretAccessKey(): string | undefined {
    return this.envConfig.AWS_SECRET_ACCESS_KEY;
  }

  get s3Bucket(): string | undefined {
    return this.envConfig.AWS_S3_BUCKET;
  }

  get twitterConsumerKey(): string | undefined {
    return this.envConfig.TWITTER_CONSUMER_KEY;
  }

  get twitterConsumerSecret(): string | undefined {
    return this.envConfig.TWITTER_CONSUMER_SECRET;
  }

  get fbAppId(): string | undefined {
    return this.envConfig.FACEBOOK_APP_ID;
  }

  get fbAppSecret(): string | undefined {
    return this.envConfig.FACEBOOK_APP_SECRET;
  }

  get fbAppToken(): string | undefined {
    return this.envConfig.FACEBOOK_APP_TOKEN;
  }

  get segmentKey(): string | undefined {
    return this.envConfig.SEGMENT_KEY;
  }

  get streamKey(): string | undefined {
    return this.envConfig.STREAM_KEY;
  }

  get streamSecret(): string | undefined {
    return this.envConfig.STREAM_SECRET;
  }

  get streamAppId(): string | undefined {
    return this.envConfig.STREAM_APP_ID;
  }

  get algoliaAppId(): string | undefined {
    return this.envConfig.ALGOLIA_APP_ID;
  }

  get algoliaApiKey(): string | undefined {
    return this.envConfig.ALGOLIA_API_KEY;
  }
}
