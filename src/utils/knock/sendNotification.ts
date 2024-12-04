import { Knock } from "@knocklabs/node"; 

interface IncidentData {
  value: string;
  station: string | number;
}

async function getStationNameById(stationId: string | number): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error("API base URL is not defined");
  }

  const response = await fetch(`${apiUrl}/api/stations/${stationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new Error(`Failed to fetch station: ${errorData.message}`);
  }

  const data = await response.json();
  return data.name; // Assuming the station object has a 'name' property
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
    const stationName = await getStationNameById(incident.station);
    const incidentDataWithStationName = {
      ...incident,
      station: stationName,
    };

    await knockNode.workflows.trigger("mts", {
      recipients: recipients,
      data: {
        incident: incidentDataWithStationName,
      },
    });
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export const recipients = [
  "iespinosas1700@alumno.ipn.mx",
  "guzmancruzandresmiguel@gmail.com",
  "andresmgc33@gmail.com",
  "a@gmail.com",
];

export default sendKnockNotification;