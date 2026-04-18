"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";

type FreelancerPublicProfile = {
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  currency: string;
  avatarUrl: string;
};

const EMPTY_PROFILE: FreelancerPublicProfile = {
  firstName: "",
  lastName: "",
  title: "",
  location: "",
  bio: "",
  skills: [],
  hourlyRate: "",
  currency: "SATS",
  avatarUrl: "",
};

export default function FreelancerPublicProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid ?? "";
  const [profile, setProfile] = useState<FreelancerPublicProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setError("Freelancer profile not found.");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const [freelancerSnap, allUsersSnap] = await Promise.all([
          getDoc(doc(firebaseDb, "freelancers", uid)),
          getDoc(doc(firebaseDb, "all_users", uid)),
        ]);

        if (!freelancerSnap.exists() && !allUsersSnap.exists()) {
          setError("Freelancer profile not found.");
          return;
        }

        const f = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};
        const a = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};

        setProfile({
          firstName: f.firstName ?? a.firstName ?? "",
          lastName: f.lastName ?? a.lastName ?? "",
          title: f.title ?? "",
          location: f.location ?? "",
          bio: f.bio ?? "",
          skills: Array.isArray(f.skills) ? f.skills : [],
          hourlyRate: f.hourlyRate ?? "",
          currency: f.currency ?? "SATS",
          avatarUrl: f.avatarUrl ?? a.avatarUrl ?? "",
        });
      } catch {
        setError("Unable to load freelancer profile.");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [uid]);

  const fullName = useMemo(
    () => [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Freelancer",
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
    <main className="min-h-screen bg-[#F7F6F3] px-4 py-8 sm:px-6 lg:px-8">
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
              <p className="text-sm text-[#666]">{profile.title || "Freelancer"}</p>
              <p className="mt-1 text-xs text-[#888]">{profile.location || "Location not specified"}</p>
            </div>
          </div>
          <Link href="/freelancer/dashboard/messages" className="text-sm text-[#8C4F00] hover:underline">
            Back to Messages
          </Link>
        </div>

        <div className="mt-6 grid gap-6">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Bio</h2>
            <p className="mt-2 text-sm leading-7 text-[#4a4a4a]">{profile.bio || "No bio provided yet."}</p>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.length ? (
                profile.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-[#F1ECE5] px-3 py-1 text-xs font-medium text-[#444]">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#888]">No skills listed.</span>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Rate</h2>
            <p className="mt-2 text-lg font-semibold text-[#1a1a1a]">
              {profile.hourlyRate ? `${profile.currency} ${profile.hourlyRate}/hr` : "Not specified"}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
