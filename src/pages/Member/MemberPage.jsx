import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUserProfile } from "../../firebase/firestore";
import AccessDenied from "../../components/common/AccessDenied";
import LegacyDashboard from "../../components/dashboard/LegacyDashboard";

export default function MemberPage() {
  const { memberId } = useParams();

  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setPermissionDenied(false);
    setError(false);

    getUserProfile(memberId)
      .then((profile) => {
        if (cancelled) return;

        if (!profile) {
          setError(true);
          setLoading(false);
          return;
        }

        setMemberProfile(profile);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Error loading member:", err);

        if (err?.code === "permission-denied") {
          setPermissionDenied(true);
        } else {
          setError(true);
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <span>LOADING MEMBER...</span>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <AccessDenied message="You can only view members in your own subsystem." />
    );
  }

  if (error || !memberProfile) {
    return (
      <div className="loading-screen">
        <span>Unable to load this member.</span>
      </div>
    );
  }

  return (
    <LegacyDashboard
      memberId={memberId}
      memberProfile={memberProfile}
    />
  );
}