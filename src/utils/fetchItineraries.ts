// fetchItineraries.ts
import { PlanResponse, Itinerary } from "@/types/map";

export const fetchItineraries = async (query: string): Promise<Itinerary[]> => {
  try {
    const otpUrl = process.env.NEXT_PUBLIC_OTP_API_BASE_URL;

    const response = await fetch(`${otpUrl}otp/routers/default/index/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data: PlanResponse = await response.json();
    console.log("Full API response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('API returned errors:', data.errors);
      return [];
    }

    if (!data.data?.plan?.itineraries) {
      console.error('Invalid data or missing itineraries:', data);
      return [];
    }

    return data.data.plan.itineraries;
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return [];
  }
};
