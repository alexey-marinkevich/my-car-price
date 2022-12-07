import { ValidationPipe } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieSession = require('cookie-session');

export const setupApp = async (app: any) => {
  app.use(
    cookieSession({
      keys: ['JD88dsjkd8s2jck2c23hklAsjUe7ejak'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
};
