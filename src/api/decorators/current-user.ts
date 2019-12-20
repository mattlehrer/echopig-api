import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (data, [root, args, ctx, info]) => ctx.req.user,
);
