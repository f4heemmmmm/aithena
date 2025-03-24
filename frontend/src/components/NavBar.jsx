import Link from 'next/link';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

export default function Navbar() {
  return (
    <nav className="bg-[#101921] shadow-md py-6"> {/* Increased padding */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-12"> {/* Added fixed height */}
          {/* Logo and company name */}
          <div className="flex items-center">
            <span className={`${openSans.className} text-3xl font-bold text-white`}>AITHENA</span>
          </div>
          
          {/* Navigation links */}
          <div className="flex items-center space-x-8 gap-3"> {/* Increased spacing */}
            <Link href="/about" className={`${openSans.className} relative group py-2 text-white text-lg font-medium  transition-colors`}>
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* <Link href="" className={`${openSans.className} relative group py-2 text-white text-lg font-medium  transition-colors`}>
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link> */}
            {/* <Link href="/login" className={`${openSans.className} relative group py-2 text-white text-lg font-medium transition-colors`}>
              Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}