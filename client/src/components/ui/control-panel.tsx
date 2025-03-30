import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Department, departments } from "@shared/schema";

interface ControlPanelProps {
  onGenerateClick: () => void;
  onExportClick: () => void;
}

const ControlPanel = ({ onGenerateClick, onExportClick }: ControlPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "all">("all");
  const [viewOption, setViewOption] = useState<"weekly" | "daily" | "list">("weekly");

  const departmentColors: Record<Department, string> = {
    PHY: "bg-[#ffcccc]",
    CHM: "bg-[#ccffcc]",
    BIO: "bg-[#ccccff]",
    MTH: "bg-[#fff2cc]",
    EES: "bg-[#ffe0cc]",
    CES: "bg-[#e6ccff]",
    ECO: "bg-[#ccffff]",
  };

  const handleGenerateClick = () => {
    onGenerateClick();
    toast({
      title: "Generating Timetable",
      description: "The timetable generation process has started.",
    });
  };

  const handleExportClick = () => {
    onExportClick();
    toast({
      title: "Exporting Timetable",
      description: "Your timetable is being prepared for export.",
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-medium mb-3">Schedule Controls</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="bg-[#4CAF50] hover:bg-[#4CAF50]/80 text-white"
              onClick={handleGenerateClick}
            >
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
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Generate Timetable
            </Button>
            <Button
              className="bg-primary hover:bg-primary/80 text-white"
              onClick={handleExportClick}
            >
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Filters</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded text-sm ${
                selectedDepartment === "all"
                  ? "bg-secondary text-primary"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedDepartment("all")}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                className={`px-3 py-1 rounded text-sm ${
                  selectedDepartment === dept
                    ? departmentColors[dept]
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">View Options</h2>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="weekly"
                name="viewOption"
                className="mr-2"
                checked={viewOption === "weekly"}
                onChange={() => setViewOption("weekly")}
              />
              <label htmlFor="weekly">Weekly</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="daily"
                name="viewOption"
                className="mr-2"
                checked={viewOption === "daily"}
                onChange={() => setViewOption("daily")}
              />
              <label htmlFor="daily">Daily</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="list"
                name="viewOption"
                className="mr-2"
                checked={viewOption === "list"}
                onChange={() => setViewOption("list")}
              />
              <label htmlFor="list">List</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
