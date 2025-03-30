import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Timetable } from "@shared/schema";

const Header = () => {
  const { data: activeTimetable } = useQuery<Timetable>({
    queryKey: ["/api/timetables/active"],
  });

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">IISERB Timetable Generator</h1>
          {activeTimetable && (
            <span className="ml-4 bg-secondary text-primary text-xs px-2 py-1 rounded">
              {activeTimetable.semester}
            </span>
          )}
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <span className="hover:text-secondary">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/generate">
                <span className="hover:text-secondary">Generate</span>
              </Link>
            </li>
            <li>
              <Link href="/constraints">
                <span className="hover:text-secondary">Constraints</span>
              </Link>
            </li>
            <li>
              <Link href="/schedules">
                <span className="hover:text-secondary">Schedules</span>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <span className="hover:text-secondary">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
