import { useEffect, useState } from "react";
import {
  subscribeToAnnouncements,
  createAnnouncement as createAnnouncementDoc,
  deleteAnnouncement as deleteAnnouncementDoc,
} from "../firebase/firestore";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting the subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToAnnouncements(
      (data) => {
        setAnnouncements(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading announcements:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { announcements, loading, error };
}

export const createAnnouncement = createAnnouncementDoc;
export const deleteAnnouncement = deleteAnnouncementDoc;