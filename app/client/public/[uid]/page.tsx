"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";

type ClientPublicProfile = {
  firstName: string;
  lastName: string;
  companyName: string;
  roleTitle: string;
  location: string;
  industry: string;
  teamSize: string;
  about: string;
  avatarUrl: string;
};

const EMPTY_PROFILE: ClientPublicProfile = {
  firstName: "",
  lastName: "",
  companyName: "",
  roleTitle: "",
  location: "",
  industry: "",
  teamSize: "",
  about: "",
  avatarUrl: "",
};

export default function ClientPublicProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid ?? "";
  const [profile, setProfile] = useState<ClientPublicProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setError("Client profile not found.");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const [clientSnap, allUsersSnap] = await Promise.all([
          getDoc(doc(firebaseDb, "clients", uid)),
          getDoc(doc(firebaseDb, "all_users", uid)),
        ]);

        if (!clientSnap.exists() && !allUsersSnap.exists()) {
          setError("Client profile not found.");
          return;
        }

        const c = clientSnap.exists() ? (clientSnap.data() as any) : {};
        const a = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};

        setProfile({
          firstName: c.firstName ?? a.firstName ?? "",
          lastName: c.lastName ?? a.lastName ?? "",
          companyName: c.companyName ?? "",
          roleTitle: c.roleTitle ?? "",
          location: c.location ?? "",
          industry: c.industry ?? "",
          teamSize: c.teamSize ?? "",
          about: c.about ?? "",
          avatarUrl: c.avatarUrl ?? a.avatarUrl ?? "",
        });
      } catch {
        setError("Unable to load client profile.");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [uid]);

  const fullName = useMemo(
    () => [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Client",
    [profile.firstName, profile.lastName],
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[#666]">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-[#EAE7E2] bg-white px-5 py-4 text-sm text-[#8C4F00]">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCF9F7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#EAE7E2] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-[#EAE7E2] bg-[#F0ECE6]">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-[#8C4F00]">
                  {fullName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1a1a1a]">{fullName}</h1>
              <p className="text-sm text-[#666]">{profile.roleTitle || "Client"}</p>
              <p className="mt-1 text-xs text-[#888]">{profile.companyName || "Company not specified"}</p>
            </div>
          </div>
          <Link href="/client/dashboard/messages" className="text-sm text-[#8C4F00] hover:underline">
            Back to Messages
          </Link>
        </div>

        <div className="mt-6 grid gap-6">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">About</h2>
            <p className="mt-2 text-sm leading-7 text-[#4a4a4a]">{profile.about || "No company description yet."}</p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Location</h3>
              <p className="mt-1 text-sm text-[#444]">{profile.location || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Industry</h3>
              <p className="mt-1 text-sm text-[#444]">{profile.industry || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Team Size</h3>
              <p className="mt-1 text-sm text-[#444]">{profile.teamSize || "Not specified"}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
