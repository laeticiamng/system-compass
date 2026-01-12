const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const getVapidPublicKey = () => import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const getServiceWorkerRegistration = async () => {
  return navigator.serviceWorker.ready;
};

export const getPushSubscription = async () => {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
};

export const subscribeToPush = async () => {
  const vapidKey = getVapidPublicKey();
  if (!vapidKey) {
    throw new Error("VAPID public key is missing");
  }
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
};

export const unsubscribeFromPush = async () => {
  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
  return subscription;
};

export const serializeSubscription = (subscription: PushSubscription) => {
  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: p256dh ? btoa(String.fromCharCode(...new Uint8Array(p256dh))) : null,
      auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : null,
    },
    expirationTime: subscription.expirationTime ?? null,
  };
};
