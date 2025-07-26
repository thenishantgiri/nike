"use client";
import React, { useState } from 'react';

interface NavbarProps {
  cartItemCount?: number;
}

export default function Navbar({ cartItemCount = 2 }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-light-100 border-b border-light-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.456 0-2.525-.616-2.525-1.848 0-.462.154-.924.462-1.232.924-.924 3.668-.462 8.316-1.694L24 7.8z"/>
            </svg>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Men</a>
              <a href="#" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Women</a>
              <a href="#" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Kids</a>
              <a href="#" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Collections</a>
              <a href="#" className="text-dark-900 hover:text-dark-700 font-jost text-body font-medium">Contact</a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-dark-900 hover:text-dark-700">
              <span className="sr-only">Search</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <span className="font-jost text-body">Search</span>
            
            <button className="text-dark-900 hover:text-dark-700 flex items-center space-x-1">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
              <span className="font-jost text-body">My Cart ({cartItemCount})</span>
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-dark-900 hover:text-dark-700"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-light-200">
            <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Men</a>
            <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Women</a>
            <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Kids</a>
            <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Collections</a>
            <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Contact</a>
            <div className="border-t border-light-300 pt-4">
              <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">Search</a>
              <a href="#" className="block px-3 py-2 text-dark-900 font-jost text-body">My Cart ({cartItemCount})</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
