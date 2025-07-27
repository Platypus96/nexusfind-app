import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M10.06 10.854 13.94 7l3.882 3.854a2.203 2.203 0 0 1 0 3.11l-3.881 3.855L10.06 14" />
              <path d="m3.937 10.854 3.882-3.854 3.882 3.854a2.203 2.203 0 0 1 0 3.11l-3.882 3.855-3.882-3.855a2.203 2.203 0 0 1 0-3.11Z" />
            </svg>
            <span className="text-xl font-bold">NexusFind</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/list-item">List an Item</Link>
            </Button>
            <Button asChild>
              <Link href="/verify">Get Verified</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
