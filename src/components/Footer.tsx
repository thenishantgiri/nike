import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Featured</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Air Force 1</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Huarache</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Air Max 90</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Air Max 95</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Shoes</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">All Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Custom Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Jordan Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Running Shoes</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Clothing</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">All Clothing</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Modest Wear</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Hoodies & Pullovers</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Shirts & Tops</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Kids&apos;</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Infant & Toddler Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Kids&apos; Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Kids&apos; Jordan Shoes</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Kids&apos; Basketball Shoes</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-jost text-caption text-dark-500">Croatia</span>
              </div>
              <span className="font-jost text-caption text-dark-500">© 2025 Nike, Inc. All Rights Reserved</span>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z"/>
                </svg>
              </a>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Guides</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Terms of Sale</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Terms of Use</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Nike Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
