import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/iiserb-logo.png";

const Header = () => {
  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IISERB Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-xl font-bold">IISERB Timetable Generator</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-secondary">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/class-timetable" className="hover:text-secondary">
                Class Timetable
              </Link>
            </li>
            <li>
              <Link href="/generate" className="hover:text-secondary">
                Generate
              </Link>
            </li>
            <li>
              <Link href="/constraints" className="hover:text-secondary">
                Constraints
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-secondary">
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
