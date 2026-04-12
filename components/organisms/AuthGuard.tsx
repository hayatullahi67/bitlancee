"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";

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

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      const run = async () => {
        if (!user) {
          setAllowed(false);
          setChecking(false);
          router.replace(redirectTo);
          return;
        }
        if (!allowedRole) {
          setAllowed(true);
          setChecking(false);
          return;
        }
        try {
          const userSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
          const role = userSnap.exists() ? (userSnap.data() as any).role : "";
          if (role === allowedRole) {
            setAllowed(true);
            setChecking(false);
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
