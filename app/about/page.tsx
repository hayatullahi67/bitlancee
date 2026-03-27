'use client';

import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { Zap, Lock, Globe, Lightbulb } from "lucide-react";

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <Header />

      <main className="font-inter bg-[#FCF9F7]">
        {/* Hero Section */}
        <section className="pt-[120px] sm:pt-[140px] pb-16 sm:pb-20 px-4 sm:px-6 lg:px-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-sora text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-[#1a1a1a] mb-6">
                About <span className="text-[#F7931A]">Bitlance</span>
              </h1>
              <p className="text-base sm:text-lg text-[#666] leading-relaxed">
                We're building the simplest, most secure freelancing platform for the Bitcoin economy—connecting talented professionals with opportunities worldwide, without borders or intermediaries.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20 bg-white">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div>
                <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6">
                  Our Mission
                </h2>
                <p className="text-base sm:text-lg text-[#666] leading-relaxed mb-4">
                  We believe talent is global, but opportunity isn't equally distributed. Traditional freelancing platforms charge high fees, require invasive verification, and limit how professionals can get paid.
                </p>
                <p className="text-base sm:text-lg text-[#666] leading-relaxed mb-4">
                  Bitlance changes that. We've built a platform where Bitcoin-native freelancers and clients connect directly, transact instantly, and keep more of what they earn.
                </p>
                <p className="text-base sm:text-lg text-[#666] leading-relaxed">
                  Our goal: make freelancing frictionless. No borders. No gatekeepers. Just work, sats, and access to opportunity.
                </p>
              </div>

              {/* Right Stat Box */}
              <div className="bg-[#F6F3F1] rounded-[40px] p-8 sm:p-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7931A] rounded-full mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#666] mb-3">Active Opportunities</p>
                <p className="font-sora text-4xl sm:text-5xl font-bold text-[#1a1a1a]">500+</p>
                <p className="text-xs sm:text-sm text-[#999] mt-4">Growing daily across all categories</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Bitlance Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-12 text-center">
              Why <span className="text-[#F7931A]">Bitlance</span>?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">No Borders</h3>
                <p className="text-[#666] leading-relaxed">
                  Work and hire globally. Bitlance operates worldwide, giving you access to talent and opportunities without geographic restrictions.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">Instant Payments</h3>
                <p className="text-[#666] leading-relaxed">
                  Get paid instantly in Bitcoin. No waiting for bank transfers or dealing with payment processors—just pure, peer-to-peer transactions.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">Secure & Private</h3>
                <p className="text-[#666] leading-relaxed">
                  Built on blockchain technology. Your transactions are secure, transparent, and private by default.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">Community-Driven</h3>
                <p className="text-[#666] leading-relaxed">
                  Built by freelancers, for freelancers. We listen to our community and continuously improve the platform.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">Low Fees</h3>
                <p className="text-[#666] leading-relaxed">
                  We keep our fees minimal so you can focus on work, not accounting. More money in your pocket.
                </p>
              </div>

              {/* Card 6 */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 7h16v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7z"/>
                    <path d="M12 17v4M8 21h8"/>
                    <path d="M4 7H2v2h20V7h-2"/>
                  </svg>
                </div>
                <h3 className="font-sora text-xl font-bold text-[#1a1a1a] mb-3">Multi-Category</h3>
                <p className="text-[#666] leading-relaxed">
                  From development to design to writing—find work across dozens of Bitcoin-related categories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About the Website Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20 bg-[#F6F3F1]">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
              About Our Platform
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-4">Built for Bitcoin</h3>
                <p className="text-[#666] leading-relaxed mb-4">
                  Bitlance is designed specifically for the Bitcoin economy. We understand the unique needs of developers, designers, writers, and professionals working in the crypto space.
                </p>
                <p className="text-[#666] leading-relaxed">
                  Every feature—from job posting to payment settlement—is optimized for Bitcoin-native workflows and instant settlement.
                </p>
              </div>

              <div>
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-4">How It Works</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F7931A] text-white font-bold text-sm flex-shrink-0 mt-1">1</span>
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Post or Browse</p>
                      <p className="text-sm text-[#666]">Find opportunities or post jobs in minutes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F7931A] text-white font-bold text-sm flex-shrink-0 mt-1">2</span>
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Connect</p>
                      <p className="text-sm text-[#666]">Negotiate terms directly with clients or freelancers</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F7931A] text-white font-bold text-sm flex-shrink-0 mt-1">3</span>
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Work</p>
                      <p className="text-sm text-[#666]">Collaborate securely on your project</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F7931A] text-white font-bold text-sm flex-shrink-0 mt-1">4</span>
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Get Paid in Sats</p>
                      <p className="text-sm text-[#666]">Receive Bitcoin instantly on completion</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Clients Can Get Freelancers */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
              How <span className="text-[#F7931A]">Clients</span> Can Get Freelancers
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left Content */}
              <div>
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-6">Post Your Project</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Create a Detailed Job Post</h4>
                      <p className="text-[#666] leading-relaxed">
                        Describe your project requirements, budget, timeline, and skills needed. Be specific about what you're looking for to attract the right freelancers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Set Your Budget in Sats</h4>
                      <p className="text-[#666] leading-relaxed">
                        Specify your budget range in Bitcoin satoshis. Our platform helps you understand fair market rates for different skill levels and project types.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Review Proposals</h4>
                      <p className="text-[#666] leading-relaxed">
                        Receive proposals from qualified freelancers. Review their portfolios, experience, and proposals to find the perfect match for your project.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Hire & Pay in Bitcoin</h4>
                      <p className="text-[#666] leading-relaxed">
                        Hire your chosen freelancer and pay instantly in Bitcoin. Our escrow system ensures both parties are protected throughout the project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Benefits */}
              <div className="bg-[#F6F3F1] rounded-[40px] p-8">
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-6">Client Benefits</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Access to global Bitcoin-native talent pool</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Instant payments with no intermediaries</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Secure escrow system protects both parties</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">No hidden fees or currency conversion costs</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Direct communication with freelancers</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Freelancers Can Get Gigs */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20 bg-[#F6F3F1]">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
              How <span className="text-[#F7931A]">Freelancers</span> Can Get Gigs
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left Content - Steps */}
              <div>
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-6">Find Your Next Opportunity</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Browse Available Jobs</h4>
                      <p className="text-[#666] leading-relaxed">
                        Explore hundreds of Bitcoin-related projects across development, design, marketing, and more. Use our filters to find projects that match your skills.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Submit Your Proposal</h4>
                      <p className="text-[#666] leading-relaxed">
                        Craft a compelling proposal highlighting your relevant experience, approach, and timeline. Showcase your Bitcoin expertise and past projects.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Get Hired & Start Working</h4>
                      <p className="text-[#666] leading-relaxed">
                        If selected, discuss project details directly with the client. Begin work immediately and get paid in Bitcoin upon completion.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1a1a] mb-2">Build Your Reputation</h4>
                      <p className="text-[#666] leading-relaxed">
                        Complete projects successfully to build your profile and attract more high-paying Bitcoin projects. Our rating system helps clients find quality talent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Benefits */}
              <div className="bg-white rounded-[40px] p-8">
                <h3 className="font-sora text-2xl font-bold text-[#1a1a1a] mb-6">Freelancer Benefits</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Get paid directly in Bitcoin with instant settlement</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Work with clients who understand crypto economics</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">No platform fees eating into your earnings</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Build a portfolio of Bitcoin-related projects</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F7931A] mt-2 flex-shrink-0"></div>
                    <p className="text-[#666]">Global opportunities without geographic restrictions</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4 text-center">
              Built by Builders
            </h2>
            <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
              Bitlance is created by a team of experienced developers, designers, and entrepreneurs passionate about Bitcoin and open-source technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team member 1 */}
              <div className="bg-white rounded-[32px] overflow-hidden text-center hover:shadow-md transition-all">
                <div className="w-full h-48 bg-gradient-to-br from-[#F7931A] to-[#8C4F00]" />
                <div className="p-6">
                  <h3 className="font-sora text-lg font-bold text-[#1a1a1a] mb-1">Development</h3>
                  <p className="text-sm text-[#666]">Expert engineers building the platform</p>
                </div>
              </div>

              {/* Team member 2 */}
              <div className="bg-white rounded-[32px] overflow-hidden text-center hover:shadow-md transition-all">
                <div className="w-full h-48 bg-gradient-to-br from-[#8C4F00] to-[#F7931A]" />
                <div className="p-6">
                  <h3 className="font-sora text-lg font-bold text-[#1a1a1a] mb-1">Design</h3>
                  <p className="text-sm text-[#666]">Creating intuitive user experiences</p>
                </div>
              </div>

              {/* Team member 3 */}
              <div className="bg-white rounded-[32px] overflow-hidden text-center hover:shadow-md transition-all">
                <div className="w-full h-48 bg-gradient-to-br from-[#F7931A] to-[#8C4F00]" />
                <div className="p-6">
                  <h3 className="font-sora text-lg font-bold text-[#1a1a1a] mb-1">Community</h3>
                  <p className="text-sm text-[#666]">Supporting our growing ecosystem</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20 bg-[#F6F3F1]">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-12 text-center">
              Our <span className="text-[#F7931A]">Values</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-[24px] p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Zap size={40} className="text-[#F7931A]" />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Speed</h3>
                <p className="text-sm text-[#666]">Fast, frictionless transactions and instant payouts</p>
              </div>

              <div className="bg-white rounded-[24px] p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Lock size={40} className="text-[#F7931A]" />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Security</h3>
                <p className="text-sm text-[#666]">Always prioritizing safety of your data and funds</p>
              </div>

              <div className="bg-white rounded-[24px] p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Globe size={40} className="text-[#F7931A]" />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Accessibility</h3>
                <p className="text-sm text-[#666]">Available to anyone, anywhere in the world</p>
              </div>

              <div className="bg-white rounded-[24px] p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Lightbulb size={40} className="text-[#F7931A]" />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">Innovation</h3>
                <p className="text-sm text-[#666]">Continuously improving based on user feedback</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-20 bg-gradient-to-r from-[#8C4F00] to-[#F7931A]">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Join the Bitcoin Economy?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're a freelancer looking for work or a client seeking talent, Bitlance is your next platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-[#8C4F00] font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-all">
                Find Work
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all">
                Post a Job
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
