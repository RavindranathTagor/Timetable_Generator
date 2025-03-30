import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface ConflictCheckerProps {
  timetableId?: number;
}

interface ConflictResponse {
  hasConflicts: boolean;
  conflicts: {
    instructorConflicts: any[];
    classroomConflicts: any[];
    studentConflicts: any[];
  };
}

const ConflictChecker = ({ timetableId }: ConflictCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictResponse | null>(null);

  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
    enabled: !timetableId,
  });

  const activeTimetableId = timetableId || activeTimetable?.id;

  const checkConflicts = async () => {
    if (!activeTimetableId) return;
    
    setIsChecking(true);
    try {
      const response = await apiRequest(
        "POST",
        "/api/check-conflicts",
        { timetableId: activeTimetableId }
      );
      const data = await response.json();
      setConflicts(data);
    } catch (error) {
      console.error("Failed to check conflicts:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-lg font-medium mb-4">Schedule Conflict Checker</h2>
      <div className="mb-4">
        {isChecking ? (
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Checking for conflicts...</span>
          </div>
        ) : conflicts ? (
          conflicts.hasConflicts ? (
            <div className="p-3 bg-[#FF5733]/10 border border-[#FF5733]/30 rounded-md flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF5733"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 mr-2 mt-0.5"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <div>
                <span className="font-medium text-[#FF5733]">Conflicts detected</span>
                <p className="text-sm mt-1">The current schedule has conflicts that need to be resolved.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/30 rounded-md flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 mr-2 mt-0.5"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <span className="font-medium text-[#4CAF50]">No conflicts detected</span>
                <p className="text-sm mt-1">The current schedule has no instructor, classroom, or student course conflicts.</p>
              </div>
            </div>
          )
        ) : (
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-between">
            <span className="text-sm">Click the button to check for scheduling conflicts</span>
            <button
              onClick={checkConflicts}
              disabled={!activeTimetableId}
              className="bg-primary text-white px-4 py-1 rounded text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Now
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Instructor Check</h3>
          <div className="p-2 bg-gray-50 border rounded text-sm">
            <div className="flex justify-between">
              <span>Instructors with conflicts:</span>
              <span className="font-medium">
                {conflicts ? conflicts.conflicts.instructorConflicts.length : 0}/
                {/* Replace with actual instructor count */}
                32
              </span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Classroom Check</h3>
          <div className="p-2 bg-gray-50 border rounded text-sm">
            <div className="flex justify-between">
              <span>Rooms with double-bookings:</span>
              <span className="font-medium">
                {conflicts ? conflicts.conflicts.classroomConflicts.length : 0}/
                {/* Replace with actual classroom count */}
                12
              </span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Student Check</h3>
          <div className="p-2 bg-gray-50 border rounded text-sm">
            <div className="flex justify-between">
              <span>Student course overlaps:</span>
              <span className="font-medium">
                {conflicts ? conflicts.conflicts.studentConflicts.length : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictChecker;
