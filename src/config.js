import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8787,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    oauthRedirectUri: process.env.META_OAUTH_REDIRECT_URI
  }
};
