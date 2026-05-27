'use client'

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/organisms/Header';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

export default function SignupPage() {
  const [userType, setUserType] = useState<'work' | 'hire'>('work');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !agreeToTerms) {
      alert('Please fill in all fields and agree to terms');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');

    const role = userType === 'work' ? 'freelancer' : 'client';
    const isFreelancer = role === 'freelancer';
    const isClient = role === 'client';

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const uid = credential.user.uid;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await updateProfile(credential.user, { displayName: fullName });

      await setDoc(doc(firebaseDb, 'all_users', uid), {
        uid,
        email,
        role,
        isFreelancer,
        isClient,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        createdAt: serverTimestamp(),
      });

      const roleCollection = role === 'freelancer' ? 'freelancers' : 'clients';
      await setDoc(doc(firebaseDb, roleCollection, uid), {
        uid,
        email,
        role,
        isFreelancer,
        isClient,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        createdAt: serverTimestamp(),
      });

      router.push(role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard');
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <Header />

      <div className="font-inter bg-gradient-to-br from-[#FCF9F7] to-[#f5ede5] min-h-screen flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-[480px]">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3">
              Join Bitlance
            </h1>
            <p className="text-[#666] text-sm sm:text-base">
              The simplest freelancing platform built for<br className="hidden sm:block" />
              the Bitcoin economy.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 border border-[#f0ebe3]">
            {/* User Type Toggle */}
            <div className="mb-8">
              <label className="text-[#999] text-xs font-bold tracking-wider uppercase mb-3 block">
                I want to...
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserType('work')}
                  className={`flex-1 py-4 rounded-3xl font-bold text-sm transition-all duration-200 ${
                    userType === 'work'
                      ? 'bg-white text-[#1a1a1a] border-2 border-[#8C4F00]'
                      : 'bg-[#F6F3F1] text-[#666] border-2 border-transparent hover:border-[#ddd]'
                  }`}
                >
                    <div className='flex justify-center'>
                  <img src="/assets/work.png" className="w-6 h-6 mr-2" alt="work icon" />
                     </div>
                  Work
                  <br />
                  <span className="text-xs font-normal">As a Freelancer</span>
                </button>
                <button
                  onClick={() => setUserType('hire')}
                  className={`flex-1 py-4 rounded-3xl font-bold text-sm transition-all duration-200 ${
                    userType === 'hire'
                      ? 'bg-white text-[#1a1a1a] border-2 border-[#8C4F00]'
                      : 'bg-[#F6F3F1] text-[#666] border-2 border-transparent hover:border-[#ddd]'
                  }`}
                >
                    <div className="flex justify-center">
                  <img src="/assets/hire.png" className="w-6 h-6 mr-2 " alt="hire icon" />
                   </div>
                  Hire
                  <br />
                  <span className="text-xs font-normal">As a Client</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#999] text-xs font-bold tracking-wider uppercase mb-2 block">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Satoshi"
                    className="w-full bg-[#f5f0e8] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder-[#ccc] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#999] text-xs font-bold tracking-wider uppercase mb-2 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nakamoto"
                    className="w-full bg-[#f5f0e8] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder-[#ccc] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors"
                  />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="text-[#999] text-xs font-bold tracking-wider uppercase mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="satoshi@p2pfoundation.org"
                  className="w-full bg-[#f5f0e8] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder-[#ccc] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[#999] text-xs font-bold tracking-wider uppercase mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f5f0e8] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder-[#ccc] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 4.24 4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#F7931A] cursor-pointer"
                  />
                  <span className="text-[#666] text-xs">
                    I agree to the{' '}
                    <Link href="#" className="text-[#F7931A] font-bold hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="#" className="text-[#F7931A] font-bold hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#8C4F00] to-[#F7931A] text-[#1a1a1a] font-bold py-3 px-6 rounded-full mt-6 hover:from-[#7a4500] hover:to-[#e68815] transition-all shadow-md hover:shadow-lg font-sora text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create My Account →'}
              </button>
              {errorMessage ? (
                <p className="text-sm text-red-600">{errorMessage}</p>
              ) : null}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e5ddd0]" />
              <span className="text-[#999] text-xs">OR</span>
              <div className="flex-1 h-px bg-[#e5ddd0]" />
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-[#666] text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#F7931A] font-bold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-[#999] text-xs">
            <Link href="#" className="hover:text-[#666]">
              NETWORK STATUS
            </Link>
            <div className="hidden sm:block w-px h-3 bg-[#e5ddd0]" />
            <Link href="#" className="hover:text-[#666]">
              PRIVACY POLICY
            </Link>
            <div className="hidden sm:block w-px h-3 bg-[#e5ddd0]" />
            <Link href="#" className="hover:text-[#666]">
              SAFE-FLOW GUIDE
            </Link>
          </div>
          <p className="text-center text-[#ccc] text-[10px] mt-4">
            © 2025 BITLANCE. BUILT FOR THE CIRCULAR BITCOIN ECONOMY.
          </p> */}
        </div>
      </div>
    </>
  );
}
