import NavLink from '../atoms/NavLink';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Find Work', href: '/findwork' },
  { label: 'Find Freelancers', href: '/find-freelancers' },
  { label: 'About', href: '/about' },
];

export default function NavMenu() {
  return (
    <nav className="hidden md:flex items-center gap-8">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
