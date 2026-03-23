import NavLink from '../atoms/NavLink';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'How It Works', href: '/how-it-works' },
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
