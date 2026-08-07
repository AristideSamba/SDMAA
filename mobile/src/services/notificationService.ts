import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import api from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
  console.log(
    "Les notifications push nécessitent un appareil physique."
  );
  return null;
}

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission refusée.");
    return null;
  }

  await Notifications.setNotificationChannelAsync(
    "sdmaa-default",
    {
      name: "Notifications SDMAA",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#800020",
    }
  );

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId;

  const token =
    (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

  console.log("Expo Push Token :", token);

  return token;
}

export async function envoyerPushTokenAuBackend(
  token: string
): Promise<void> {
  try {
    await api.put(
      "/utilisateurs/me/push-token",
      {
        token,
      }
    );

    console.log(
      "Push token enregistré."
    );
  } catch (error) {
    console.error(
      "Erreur enregistrement push token :",
      error
    );
  }
}