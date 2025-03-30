import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClassSchedule from "@/components/ui/class-schedule";
import DepartmentSchedule from "@/components/ui/department-schedule";
import CSETimetableView from "@/components/ui/cse-timetable-view";
import { Timetable, TimetableWithClasses } from "@shared/schema";
import { exportTimetable } from "@/lib/export-utils";

const Schedules = () => {
  const { data: activeTimetable, isLoading } = useQuery<Timetable>({
    queryKey: ["/api/timetables/active"],
  });

  const { data: timetableWithClasses, isLoading: isLoadingClasses } = useQuery<TimetableWithClasses>({
    queryKey: ["/api/timetables/withClasses", activeTimetable?.id],
    enabled: !!activeTimetable,
  });

  const { data: timetables } = useQuery<Timetable[]>({
    queryKey: ["/api/timetables"],
  });

  const handleExport = (format: 'pdf' | 'csv' | 'image') => {
    if (!timetableWithClasses) return;
    exportTimetable(timetableWithClasses, format, `cse-timetable-${timetableWithClasses.name}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSE Timetable Schedules</CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading || isLoadingClasses ? (
            <div className="text-center py-10">Loading timetable information...</div>
          ) : !activeTimetable ? (
            <div className="text-center py-10">
              No active timetable found. Generate a timetable and set it as active to view schedules.
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">
                Active Timetable: {activeTimetable.name} ({activeTimetable.semester})
              </h2>
              
              <Tabs defaultValue="cse" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="cse">CSE Department Timetable</TabsTrigger>
                  <TabsTrigger value="department">Faculty-wise Schedule</TabsTrigger>
                  <TabsTrigger value="class">Class-wise Schedule</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cse">
                  {timetableWithClasses && (
                    <CSETimetableView 
                      timetable={timetableWithClasses} 
                      onExport={handleExport}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="department">
                  <DepartmentSchedule timetableId={activeTimetable.id} />
                </TabsContent>
                
                <TabsContent value="class">
                  <ClassSchedule timetableId={activeTimetable.id} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;