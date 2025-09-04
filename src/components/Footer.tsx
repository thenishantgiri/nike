import SmartImage from "@/components/SmartImage";
import Link from "next/link";

// Furniture-focused footer with generic links. Tweak labels/links per brand.
export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Shop by Room</h3>
            <ul className="space-y-3">
              <li><Link href="/products?room=living-room" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Living Room</Link></li>
              <li><Link href="/products?room=bedroom" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Bedroom</Link></li>
              <li><Link href="/products?room=dining-room" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Dining Room</Link></li>
              <li><Link href="/products?room=office" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Office</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Furniture</h3>
            <ul className="space-y-3">
              <li><Link href="/products?category=sofas" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Sofas</Link></li>
              <li><Link href="/products?category=tables" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Tables</Link></li>
              <li><Link href="/products?category=chairs" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Chairs</Link></li>
              <li><Link href="/products?category=beds" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Beds</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Collections</h3>
            <ul className="space-y-3">
              <li><Link href="/products?collection=modern-living" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Modern Living</Link></li>
              <li><Link href="/products?collection=scandinavian" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Scandinavian</Link></li>
              <li><Link href="/products?collection=new-arrivals" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">New Arrivals</Link></li>
              <li><Link href="/products" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Care Guides</a></li>
              <li><a href="#" className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors">Contact Us</a></li>
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
                <span className="font-jost text-caption text-dark-500">United Kingdom</span>
              </div>
              <span className="font-jost text-caption text-dark-500">© 2025 Acme Home. All Rights Reserved</span>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <SmartImage src="/x.svg" alt="x" width={18} height={18} className="object-contain" />
                </div>
              </a>
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">Facebook</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <SmartImage src="/facebook.svg" alt="facebook" width={18} height={18} className="object-contain" />
                </div>
              </a>
              <a href="#" className="text-dark-500 hover:text-light-100 transition-colors">
                <span className="sr-only">Instagram</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <SmartImage src="/instagram.svg" alt="instagram" width={18} height={18} className="object-contain" />
                </div>
              </a>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Guides</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Terms of Sale</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Terms of Use</a>
              <a href="#" className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
