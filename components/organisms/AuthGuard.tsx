"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firebaseDb, firebaseRtdb } from "@/lib/firebase";
import { ref, onValue, onDisconnect, set as rtdbSet, serverTimestamp as rtdbServerTimestamp } from "firebase/database";

type AuthGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRole?: "client" | "freelancer";
};

export default function AuthGuard({
  children,
  redirectTo = "/login",
  allowedRole,
}: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const presenceListener = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      const run = async () => {
        if (!user) {
          setCurrentUserId(null);
          setAllowed(false);
          setChecking(false);
          router.replace(redirectTo);
          return;
        }
        setCurrentUserId(user.uid);
        if (!allowedRole) {
          setAllowed(true);
          setChecking(false);
          try {
            await setDoc(
              doc(firebaseDb, "all_users", user.uid),
              { online: true, lastSeen: serverTimestamp() },
              { merge: true }
            );
          } catch {
            // ignore
          }
          return;
        }
        try {
          const userSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
          const role = userSnap.exists() ? (userSnap.data() as any).role : "";
          if (role === allowedRole) {
            setAllowed(true);
            setChecking(false);
            try {
              await setDoc(
                doc(firebaseDb, "all_users", user.uid),
                { online: true, lastSeen: serverTimestamp() },
                { merge: true }
              );
            } catch {
              // ignore
            }
            return;
          }
          setAllowed(false);
          setChecking(false);
          if (role === "client") {
            router.replace("/client/dashboard");
          } else if (role === "freelancer") {
            router.replace("/freelancer/dashboard");
          } else {
            router.replace(redirectTo);
          }
        } catch {
          setAllowed(false);
          setChecking(false);
          router.replace(redirectTo);
        }
      };
      run();
    });
    return () => unsubscribe();
  }, [router, redirectTo, allowedRole]);

  useEffect(() => {
    if (!currentUserId) return;
    const setOnlineStatus = async (online: boolean) => {
      try {
        await updateDoc(doc(firebaseDb, "all_users", currentUserId), {
          online,
          lastSeen: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setOnlineStatus(false);
      } else {
        setOnlineStatus(true);
      }
    };

    const handleBeforeUnload = () => {
      setOnlineStatus(false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const userStatusDatabaseRef = ref(firebaseRtdb, `/status/${currentUserId}`);
    const isOfflineForDatabase = {
      state: "offline",
      last_changed: rtdbServerTimestamp(),
    };
    const isOnlineForDatabase = {
      state: "online",
      last_changed: rtdbServerTimestamp(),
    };

    if (presenceListener.current) {
      presenceListener.current();
      presenceListener.current = null;
    }

    const connectedRef = ref(firebaseRtdb, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === false) return;
      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase);
      rtdbSet(userStatusDatabaseRef, isOnlineForDatabase);
    });
    presenceListener.current = unsubscribe;

    return () => {
      if (presenceListener.current) {
        presenceListener.current();
        presenceListener.current = null;
      }
    };
  }, [currentUserId]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCF9F7] text-[#6b6762] text-sm">
        Checking session...
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
