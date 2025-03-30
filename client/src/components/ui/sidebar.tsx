import { useQuery } from "@tanstack/react-query";
import { Department, departments } from "@shared/schema";

interface SidebarProps {
  activeTimetableId?: number;
}

const Sidebar = ({ activeTimetableId }: SidebarProps) => {
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
  });

  const { data: classrooms } = useQuery({
    queryKey: ["/api/classrooms"],
  });

  const { data: scheduledClasses } = useQuery({
    queryKey: ["/api/scheduled-classes"],
    enabled: !!activeTimetableId,
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/scheduled-classes?timetableId=${activeTimetableId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch scheduled classes");
      }
      return res.json();
    },
  });

  const departmentColors: Record<Department, string> = {
    PHY: "bg-[#ffcccc]",
    CHM: "bg-[#ccffcc]",
    BIO: "bg-[#ccccff]",
    MTH: "bg-[#fff2cc]",
    EES: "bg-[#ffe0cc]",
    CES: "bg-[#e6ccff]",
    ECO: "bg-[#ccffff]",
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sidebar-sticky">
      <h2 className="text-lg font-medium mb-3">Schedule Metadata</h2>

      <div className="mb-4">
        <h3 className="font-medium text-sm text-gray-500 mb-2">Status</h3>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></span>
          <span className="text-sm">Generated successfully</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-sm text-gray-500 mb-2">Statistics</h3>
        <ul className="text-sm space-y-1">
          <li className="flex justify-between">
            <span>Total Courses:</span>
            <span className="font-medium">{courses?.length || 0}</span>
          </li>
          <li className="flex justify-between">
            <span>Total Instructors:</span>
            <span className="font-medium">{instructors?.length || 0}</span>
          </li>
          <li className="flex justify-between">
            <span>Classrooms Used:</span>
            <span className="font-medium">{classrooms?.length || 0}</span>
          </li>
          <li className="flex justify-between">
            <span>Time Slots:</span>
            <span className="font-medium">9 AM - 6 PM</span>
          </li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-sm text-gray-500 mb-2">Departments</h3>
        <div className="space-y-2 text-sm">
          {departments.map((dept) => (
            <div key={dept} className="flex items-center">
              <span className={`w-3 h-3 rounded-full ${departmentColors[dept]} mr-2`}></span>
              <span>{dept} - {getDepartmentFullName(dept)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm text-gray-500 mb-2">Actions</h3>
        <div className="space-y-2">
          <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Advanced Filters
          </button>
          <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            Show Conflicts
          </button>
          <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Constraints
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the full department name
function getDepartmentFullName(dept: Department): string {
  const names: Record<Department, string> = {
    PHY: "Physics",
    CHM: "Chemistry",
    BIO: "Biology",
    MTH: "Mathematics",
    EES: "Earth & Env. Sciences",
    CES: "Computer & Electrical",
    ECO: "Economics"
  };
  return names[dept];
}

export default Sidebar;
