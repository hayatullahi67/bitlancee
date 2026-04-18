"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Button from "@/components/atoms/Button";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

type ClientProfile = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  companyName: string;
  roleTitle: string;
  phone: string;
  website: string;
  location: string;
  industry: string;
  teamSize: string;
  about: string;
  avatarUrl?: string;
  avatarPublicId?: string;
};

const EMPTY_PROFILE: ClientProfile = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  companyName: "",
  roleTitle: "",
  phone: "",
  website: "",
  location: "",
  industry: "",
  teamSize: "",
  about: "",
  avatarUrl: "",
  avatarPublicId: "",
};

export default function ClientProfileContent() {
  const [profile, setProfile] = useState<ClientProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsLoading(false);
        setErrorMessage("Please log in to view your profile.");
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
        const clientSnap = await getDoc(doc(firebaseDb, "clients", user.uid));
        const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
        const clientData = clientSnap.exists() ? (clientSnap.data() as any) : {};
        const firstName = allData.firstName ?? "";
        const lastName = allData.lastName ?? "";
        const fullName = allData.fullName ?? `${firstName} ${lastName}`.trim();
        setProfile({
          firstName,
          lastName,
          fullName,
          email: allData.email ?? user.email ?? "",
          companyName: clientData.companyName ?? "",
          roleTitle: clientData.roleTitle ?? "Hiring Manager",
          phone: clientData.phone ?? "",
          website: clientData.website ?? "",
          location: clientData.location ?? "",
          industry: clientData.industry ?? "",
          teamSize: clientData.teamSize ?? "",
          about:
            clientData.about ??
            "Tell freelancers about your company, goals, and how you like to collaborate.",
          avatarUrl: clientData.avatarUrl ?? allData.avatarUrl ?? "",
          avatarPublicId: clientData.avatarPublicId ?? allData.avatarPublicId ?? "",
        });
      } catch {
        setErrorMessage("Unable to load your profile right now.");
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const initials = useMemo(() => {
    const name = profile.fullName || `${profile.firstName} ${profile.lastName}`.trim() || "Client";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile.fullName, profile.firstName, profile.lastName]);

  const displayName =
    profile.fullName || `${profile.firstName} ${profile.lastName}`.trim() || "Client Profile";

  const handleChange = (field: keyof ClientProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    if (!profile.firstName.trim() || !profile.lastName.trim()) return;

    setIsSaving(true);
    try {
      const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();
      await updateDoc(doc(firebaseDb, "all_users", user.uid), {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        fullName,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(firebaseDb, "clients", user.uid), {
        companyName: profile.companyName.trim(),
        roleTitle: profile.roleTitle.trim(),
        phone: profile.phone.trim(),
        website: profile.website.trim(),
        location: profile.location.trim(),
        industry: profile.industry.trim(),
        teamSize: profile.teamSize.trim(),
        about: profile.about.trim(),
        avatarUrl: profile.avatarUrl ?? "",
        avatarPublicId: profile.avatarPublicId ?? "",
        updatedAt: serverTimestamp(),
      });
      setProfile((prev) => ({ ...prev, fullName }));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Use JPG, PNG, or WEBP for avatar.");
      event.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage("Avatar image must be 2MB or less.");
      event.target.value = "";
      return;
    }

    const user = firebaseAuth.currentUser;
    if (!user) {
      setErrorMessage("Please log in again to upload avatar.");
      event.target.value = "";
      return;
    }

    try {
      setErrorMessage("");
      setAvatarUploading(true);
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const uploadPayload = (await uploadResponse.json()) as {
        avatarUrl?: string;
        avatarPublicId?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !uploadPayload.avatarUrl || !uploadPayload.avatarPublicId) {
        throw new Error(uploadPayload.error || "Avatar upload failed.");
      }

      const avatarFields = {
        avatarUrl: uploadPayload.avatarUrl,
        avatarPublicId: uploadPayload.avatarPublicId,
        updatedAt: serverTimestamp(),
      };

      await Promise.all([
        updateDoc(doc(firebaseDb, "clients", user.uid), avatarFields),
        updateDoc(doc(firebaseDb, "all_users", user.uid), avatarFields),
      ]);

      setProfile((prev) => ({
        ...prev,
        avatarUrl: uploadPayload.avatarUrl ?? "",
        avatarPublicId: uploadPayload.avatarPublicId ?? "",
      }));
    } catch (error) {
      console.error("Client avatar upload failed:", error);
      setErrorMessage("Could not upload avatar. Please retry.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6 text-[12px] text-[#6b6762]">
        Loading profile...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[16px] border border-[#EAE7E2] bg-[#FFF6F2] p-6 text-[12px] text-[#8C4F00]">
        {errorMessage}
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <label className="group relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border border-[#EAE7E2] bg-[#F6EFE6]">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#8C4F00] font-bold text-lg">
                  {initials || "CL"}
                </div>
              )}
              <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-[10px] font-semibold uppercase tracking-[0.06em] text-white group-hover:flex">
                {avatarUploading ? "Uploading..." : "Change"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleClientAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                Client Profile
              </div>
              <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
                {displayName}
              </h1>
              <p className="mt-1 text-[12px] text-[#6b6762]">
                {profile.companyName || "Add your company name to get started."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            {isEditing ? (
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Company Overview
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="First Name"
              value={profile.firstName}
              onChange={(value) => handleChange("firstName", value)}
              isEditing={isEditing}
            />
            <Field
              label="Last Name"
              value={profile.lastName}
              onChange={(value) => handleChange("lastName", value)}
              isEditing={isEditing}
            />
            <Field
              label="Company"
              value={profile.companyName}
              onChange={(value) => handleChange("companyName", value)}
              isEditing={isEditing}
              placeholder="Atlas Ventures"
            />
            <Field
              label="Role / Title"
              value={profile.roleTitle}
              onChange={(value) => handleChange("roleTitle", value)}
              isEditing={isEditing}
              placeholder="Hiring Manager"
            />
            <Field
              label="Industry"
              value={profile.industry}
              onChange={(value) => handleChange("industry", value)}
              isEditing={isEditing}
              placeholder="Fintech"
            />
            <Field
              label="Team Size"
              value={profile.teamSize}
              onChange={(value) => handleChange("teamSize", value)}
              isEditing={isEditing}
              placeholder="11-50"
            />
            <Field
              label="Location"
              value={profile.location}
              onChange={(value) => handleChange("location", value)}
              isEditing={isEditing}
              placeholder="Remote"
            />
            <Field
              label="Website"
              value={profile.website}
              onChange={(value) => handleChange("website", value)}
              isEditing={isEditing}
              placeholder="https://"
            />
          </div>
          <div className="mt-6">
            <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">
              About Your Company
            </label>
            {isEditing ? (
              <textarea
                rows={5}
                value={profile.about}
                onChange={(e) => handleChange("about", e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#EAE7E2] px-3 py-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            ) : (
              <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
                {profile.about}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[16px] border border-[#EAE7E2] bg-[#F9F6F2] p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Contact Details
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field
              label="Email"
              value={profile.email}
              onChange={() => {}}
              isEditing={false}
              readOnly
            />
            <Field
              label="Phone"
              value={profile.phone}
              onChange={(value) => handleChange("phone", value)}
              isEditing={isEditing}
              placeholder="+234"
            />
          </div>
          <div className="mt-6 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
              Hiring Preference
            </div>
            <div className="mt-2 text-[12px] text-[#6b6762]">
              Share clear scopes, budgets, and timelines to attract top Bitcoin-native talent.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  isEditing,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">{label}</label>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      ) : (
        <div className="rounded-lg border border-[#EFECE7] bg-white px-3 py-2 text-[12px] text-[#1a1a1a]">
          {value || "-"}
        </div>
      )}
    </div>
  );
}
