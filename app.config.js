// app.config.js - expose .env values to Expo Constants.extra
// Install `dotenv` (npm i -D dotenv) and create a `.env` file at project root.
require('dotenv').config();

module.exports = ({ config }) => {
  const existingExtra = config.extra || {};

  // Preserve existing `extra` keys (including `extra.eas.projectId`) and
  // override only when env values are provided. This prevents accidental
  // removal of the EAS projectId when using app.config.js.
  return {
    ...config,
    extra: {
      ...existingExtra,
      API_BASE_URL: process.env.API_BASE_URL || existingExtra.API_BASE_URL,
      RAZORPAY_KEY: process.env.RAZORPAY_KEY || existingExtra.RAZORPAY_KEY,
      eas: {
        ...(existingExtra.eas || {}),
        projectId: process.env.EAS_PROJECT_ID || (existingExtra.eas && existingExtra.eas.projectId),
      },
    },
  };
};
