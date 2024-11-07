// src/utils/fetchItineraries.ts

import { PlanResponse, Itinerary } from "@/types/map";

export const fetchItineraries = async (query: string): Promise<Itinerary | null> => {
  try {
    const otpUrl = process.env.NEXT_PUBLIC_OTP_API_BASE_URL;

    const response = await fetch(`${otpUrl}otp/routers/default/index/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: PlanResponse = await response.json();
    console.log("API response data:", data);

    if (data.errors || !data.data?.plan?.itineraries) {
      console.error('Invalid data or errors:', data.errors);
      return null;
    }

    const shortestItinerary = data.data.plan.itineraries.reduce((prev, current) =>
      prev.duration < current.duration ? prev : current
    );
    return shortestItinerary;
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return null;
  }
};