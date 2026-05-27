import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Bitlance home"
      className="flex items-center gap-2 text-decoration-none group"
    >
      {/* Icon Branding */}
      <div className="">
        <Image
          src="/assets/logo.png"
          alt="Bitlance Logo"
          width={30}
          height={30}
          className="object-contain"
          priority
        />
      </div>

      {/* Wordmark */}
      <span className="text-lg font-bold tracking-tight text-zinc-900 group-hover:text-orange-500 transition-colors">
        Bitlance
      </span>
    </Link>
  )
}
