import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const scheduleNotification = async (name, dueDate) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Loan Reminder",
      body: `Loan due for ${name}`,
    },
    trigger: { date: new Date(dueDate) },
  });
};