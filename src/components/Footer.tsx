import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">
              Featured
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Air Force 1
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Huarache
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Air Max 90
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Air Max 95
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">
              Shoes
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  All Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Custom Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Jordan Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Running Shoes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">
              Clothing
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  All Clothing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Modest Wear
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Hoodies & Pullovers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Shirts & Tops
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-jost text-body-medium font-medium mb-4">
              Kids&apos;
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Infant & Toddler Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Kids&apos; Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Kids&apos; Jordan Shoes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-jost text-body text-dark-500 hover:text-light-100 transition-colors"
                >
                  Kids&apos; Basketball Shoes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-jost text-caption text-dark-500">
                  Croatia
                </span>
              </div>
              <span className="font-jost text-caption text-dark-500">
                © 2025 Nike, Inc. All Rights Reserved
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-dark-500 hover:text-light-100 transition-colors"
              >
                <span className="sr-only">X (Twitter)</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <Image
                    src="x.svg"
                    alt="x"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
              </a>
              <a
                href="#"
                className="text-dark-500 hover:text-light-100 transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <Image
                    src="facebook.svg"
                    alt="x"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
              </a>
              <a
                href="#"
                className="text-dark-500 hover:text-light-100 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <div className="size-9 flex items-center justify-center rounded-full bg-white relative">
                  <Image
                    src="instagram.svg"
                    alt="x"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
              </a>
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors"
              >
                Guides
              </a>
              <a
                href="#"
                className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors"
              >
                Terms of Sale
              </a>
              <a
                href="#"
                className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors"
              >
                Terms of Use
              </a>
              <a
                href="#"
                className="font-jost text-caption text-dark-500 hover:text-light-100 transition-colors"
              >
                Nike Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
