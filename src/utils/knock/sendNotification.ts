import { Knock } from "@knocklabs/node"; 

interface IncidentData {
  value: string;
  station: string;
}

async function sendKnockNotification(
  recipients: string[],
  incident: IncidentData
) {
  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_SECRET_API_KEY;

  if (!knockApiKey) {
    throw new Error("NEXT_PUBLIC_KNOCK_SECRET_API_KEY is not defined");
  }

  const knockNode = new Knock(knockApiKey);

  try {
    await knockNode.workflows.trigger("mts", {
      recipients: recipients,
      data: {
        incident: incident,
      },
    });
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export const recipients = [
  "iespinosas1700@alumno.ipn.mx",
  "jangeles1700@alumno.ipn.mx",
  "aguzman1702@alumno.ipn.mx",
  "agarciaz1703@alumno.ipn.mx",
];

export default sendKnockNotification;
