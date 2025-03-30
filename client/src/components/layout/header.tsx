import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

const Header = () => {
  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">IISERB Timetable Generator</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="hover:text-secondary">Dashboard</a>
              </Link>
            </li>
            <li>
              <Link href="/class-timetable">
                <a className="hover:text-secondary">Class Timetable</a>
              </Link>
            </li>
            <li>
              <Link href="/generate">
                <a className="hover:text-secondary">Generate</a>
              </Link>
            </li>
            <li>
              <Link href="/constraints">
                <a className="hover:text-secondary">Constraints</a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a className="hover:text-secondary">Settings</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
