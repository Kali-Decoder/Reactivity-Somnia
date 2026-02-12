"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, BookOpen } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Game", icon: Gamepad2 },
    { href: "/docs", label: "Documentation", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-monad-purple" />
            <span className="text-lg font-bold bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-transparent">
              Magic Chest Game
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    isActive
                      ? "text-white bg-monad-purple/20 border-b-2 border-monad-purple"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

