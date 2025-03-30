import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClassSchedule from "@/components/ui/class-schedule";
import DepartmentSchedule from "@/components/ui/department-schedule";
import { Timetable } from "@shared/schema";

const Schedules = () => {
  const { data: activeTimetable, isLoading } = useQuery<Timetable>({
    queryKey: ["/api/timetables/active"],
  });

  const { data: timetables } = useQuery<Timetable[]>({
    queryKey: ["/api/timetables"],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
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
              
              <Tabs defaultValue="department" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="department">Department-wise Faculty Schedule</TabsTrigger>
                  <TabsTrigger value="class">Class-wise Schedule</TabsTrigger>
                </TabsList>
                
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