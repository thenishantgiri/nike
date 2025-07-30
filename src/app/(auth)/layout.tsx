import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 to-dark-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-light-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange rounded-xl flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Nike"
                width={24}
                height={9}
                className="brightness-0 invert"
              />
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold font-jost mb-4">
              Just Do It
            </h1>
            <p className="text-lg text-light-300 font-jost leading-relaxed mb-8">
              Join millions of athletes and fitness enthusiasts who trust Nike for their performance needs.
            </p>
            
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-light-100 rounded-full"></div>
              <div className="w-2 h-2 bg-light-400 rounded-full"></div>
              <div className="w-2 h-2 bg-light-400 rounded-full"></div>
            </div>
          </div>

          <div className="text-sm text-light-400 font-jost">
            © 2024 Nike. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-light-100">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
