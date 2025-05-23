import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/iiserb-logo.png";

const Header = () => {
  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  return (
    <header className="bg-white text-black shadow-md sticky top-0 z-50 border-b-4 border-[#CC0000]">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IISERB Logo" className="h-12 w-12 rounded-full border-2 border-[#2B2F8E]" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">IISER Bhopal Timetable</h1>
            <p className="text-xs text-gray-600">INDIAN INSTITUTE OF SCIENCE EDUCATION AND RESEARCH BHOPAL</p>
          </div>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-[#2B2F8E] transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/class-timetable" className="hover:text-[#2B2F8E] transition-colors">
                Class Timetable
              </Link>
            </li>
            <li>
              <Link href="/generate" className="hover:text-[#2B2F8E] transition-colors">
                Generate
              </Link>
            </li>
            <li>
              <Link href="/constraints" className="hover:text-[#2B2F8E] transition-colors">
                Constraints
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-[#2B2F8E] transition-colors">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
