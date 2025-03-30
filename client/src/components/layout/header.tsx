import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClipboardList, Home, FolderOpen, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">TaskMaster</h1>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/">
                <div className="flex items-center hover:text-secondary">
                  <Home className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Dashboard</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/tasks">
                <div className="flex items-center hover:text-secondary">
                  <ClipboardList className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Tasks</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/projects">
                <div className="flex items-center hover:text-secondary">
                  <FolderOpen className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Projects</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <div className="flex items-center hover:text-secondary">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-secondary text-primary">AU</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline ml-2">Profile</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
