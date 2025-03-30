import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import ControlPanel from "@/components/ui/control-panel";
import Sidebar from "@/components/ui/sidebar";
import TimetableView from "@/components/ui/timetable-view";
import ConflictChecker from "@/components/ui/conflict-checker";
import { exportTimetable } from "@/lib/export-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExportDialog from "@/components/dialogs/ExportDialog";
import { Department } from "@shared/schema";

const Dashboard = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "all">("all");
  const timetableRef = useRef<HTMLDivElement>(null);
  
  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  const { data: timetableData, isLoading } = useQuery({
    queryKey: [`/api/timetable-data/${activeTimetable?.id}`],
    enabled: !!activeTimetable?.id,
  });

  const handleGenerateClick = () => {
    window.location.href = "/generate";
  };

  const handleExportClick = () => {
    setShowExportDialog(true);
  };
  
  const handleDepartmentChange = (dept: Department | "all") => {
    setSelectedDepartment(dept);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'image') => {
    if (!timetableData) return;
    
    try {
      await exportTimetable(
        timetableData, 
        format, 
        format === 'image' ? '.timetable-container' : undefined
      );
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting timetable:', error);
    }
  };

  return (
    <>
      <ControlPanel 
        onGenerateClick={handleGenerateClick} 
        onExportClick={handleExportClick} 
        onDepartmentChange={handleDepartmentChange}
      />
    
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <Sidebar activeTimetableId={activeTimetable?.id} />
        </div>
        
        {/* Timetable */}
        <div className="w-full md:w-3/4 lg:w-4/5" ref={timetableRef}>
          <div className="timetable-container">
            <TimetableView 
              timetableId={activeTimetable?.id} 
              selectedDepartment={selectedDepartment}
            />
          </div>
        </div>
      </div>
      
      <ConflictChecker timetableId={activeTimetable?.id} />

      <ExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
      />
    </>
  );
};

export default Dashboard;
