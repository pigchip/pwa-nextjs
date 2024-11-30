import { useEffect, useState } from "react";
import { Knock } from "@knocklabs/node";

export const useStoredEmail = () => {
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setStoredEmail(email);
    } else {
      console.warn("Email not found in localStorage. Using default.");
      setStoredEmail("iespinosas1700@alumno.ipn.mx");
    }
  }, []);

  return storedEmail;
};

export const useKnockUser = (storedEmail: string | null, userDetails: any) => {
  useEffect(() => {
    if (!storedEmail) return;

    const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET_API_KEY);
    knockClient.users
      .identify(storedEmail, {
        email: storedEmail,
        name: userDetails?.name,
      })
      .then((knockUser) => {
        console.log("Knock user identified:", knockUser);
      })
      .catch((error) => {
        console.error("Error identifying user with Knock:", error);
      });
  }, [storedEmail, userDetails]);
};
