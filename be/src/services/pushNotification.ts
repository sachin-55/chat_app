import webpush from "web-push";
import { config } from "@/config";

const publicVapidKey = config.VAPID_PUBLIC_KEY;
const privateVapidKey = config.VAPID_PRIVATE_KEY;

export const initWebPushNotification = () => {
  if (!publicVapidKey || !privateVapidKey) {
    throw new Error("VAPID keys are not defined");
  }

  webpush.setVapidDetails(
    `mailto:${config.VAPID_EMAIL}`,
    publicVapidKey,
    privateVapidKey,
  );
};
