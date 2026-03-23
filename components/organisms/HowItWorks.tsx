'use client';

import StepCard from '../atoms/StepCard';

const WORKFLOW = [
  {
    number: 1,
    title: 'Clients post jobs',
    description: 'Describe your project and set your budget in Bitcoin (Sats). Reach a global talent pool instantly.',
    iconSrc: '/assets/image1.png',
  },
  {
    number: 2,
    title: 'Submit Proposals',
    description: 'Freelancers apply with their portfolio and rates. Use our communication tools to finalize details.',
    iconSrc: '/assets/image2.png',
  },
  {
    number: 3,
    title: 'Get Paid Instantly',
    description: 'Once work is approved, funds are released instantly via Lightning Network. No wait times.',
    iconSrc: '/assets/image3.png',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#1a1a1a]">How Bitlance Works</h2>
          <p className="mt-3 text-sm text-[#666]">Bitcoin native payments meet modern freelance tools.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {WORKFLOW.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              iconSrc={step.iconSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
