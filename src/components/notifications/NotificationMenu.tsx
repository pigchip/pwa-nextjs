"use client";

import { useState, useRef, useEffect } from "react";
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";

// Required CSS import, unless you're overriding the styling
import "@knocklabs/react/dist/index.css";
import useUserStore from "@/stores/useUser";

const NotificationMenu = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  const { userDetails } = useUserStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient ? (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY || ""}
      userId={userDetails?.email || "iespinosas1700@alumno.ipn.mx"}
      i18n={{
        translations: {
          emptyFeedTitle: "No tienes notificaciones aún",
          emptyFeedBody: "Te haremos saber cuando tengas una notificación",
          notifications: "Notificaciones",
          poweredBy: "Powered by MTS",
          markAllAsRead: "Marcar todas como leídas",
          archiveNotification: "Archivar notificación",
          all: "Todas",
          unread: "No leídas",
          read: "Leídas",
          unseen: "No vistas",
        },
        locale: "es"
      }}
    >
      <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || ""}>
        <>
          <NotificationIconButton
            ref={notifButtonRef}
            onClick={(e) => setIsVisible(!isVisible)}
          />
          <NotificationFeedPopover
            buttonRef={notifButtonRef}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
        </>
      </KnockFeedProvider>
    </KnockProvider>
    ) :
    <NotificationsIcon />
  );
};

export default NotificationMenu;