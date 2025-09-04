"use client";

import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cart.store";

interface NavbarProps {
  cartItemCount?: number;
}

export default function Navbar({ cartItemCount = 2 }: NavbarProps) {
  const count = useCart((s) => s.cart.count) ?? cartItemCount;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-light-100 border-b border-light-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <SmartImage
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={12}
              className="grayscale invert brightness-100"
            />
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/products?category=sofas" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Sofas</Link>
              <Link href="/products?category=tables" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Tables</Link>
              <Link href="/products?category=chairs" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Chairs</Link>
              <Link href="/products?category=beds" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Beds</Link>
              <Link href="/products?category=storage" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Storage</Link>
              <Link href="/products?collection=modern-living" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Modern</Link>
              <Link href="/products?collection=scandinavian" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Scandi</Link>
              <Link href="/products?collection=new-arrivals" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">New</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-dark-900 hover:text-dark-700">
              <span className="sr-only">Search</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <span className="font-jost text-body">Search</span>

            <Link href="/cart" className="text-dark-900 hover:text-dark-700 flex items-center space-x-1">
              <span className="font-jost text-body">
                My Cart ({count})
              </span>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-dark-900 hover:text-dark-700"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-light-200">
            <Link href="/products?category=sofas" className="block px-3 py-2 text-dark-900 font-jost text-body">Sofas</Link>
            <Link href="/products?category=tables" className="block px-3 py-2 text-dark-900 font-jost text-body">Tables</Link>
            <Link href="/products?category=chairs" className="block px-3 py-2 text-dark-900 font-jost text-body">Chairs</Link>
            <Link href="/products?category=beds" className="block px-3 py-2 text-dark-900 font-jost text-body">Beds</Link>
            <Link href="/products?category=storage" className="block px-3 py-2 text-dark-900 font-jost text-body">Storage</Link>
            <div className="border-t border-light-300 pt-4">
              <span className="block px-3 py-2 font-jost text-body text-dark-700">Collections</span>
              <Link href="/products?collection=modern-living" className="block px-3 py-2 text-dark-900 font-jost text-body">Modern Living</Link>
              <Link href="/products?collection=scandinavian" className="block px-3 py-2 text-dark-900 font-jost text-body">Scandinavian</Link>
              <Link href="/products?collection=new-arrivals" className="block px-3 py-2 text-dark-900 font-jost text-body">New Arrivals</Link>
            </div>
            <div className="border-t border-light-300 pt-4">
              <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Search</a>
              <Link href="/cart" className="block px-3 py-2 text-dark-900 font-jost text-body">My Cart ({count})</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
