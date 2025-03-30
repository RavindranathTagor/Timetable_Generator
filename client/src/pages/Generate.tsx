import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateTimetable } from "@/lib/timetable-generator";
import CourseForm from "@/components/forms/CourseForm";
import InstructorForm from "@/components/forms/InstructorForm";
import ClassroomForm from "@/components/forms/ClassroomForm";
import GenerateTimetableForm from "@/components/forms/GenerateTimetableForm";

const Generate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("generate");

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
  });

  const { data: classrooms } = useQuery({
    queryKey: ["/api/classrooms"],
  });

  const { data: constraints } = useQuery({
    queryKey: ["/api/constraints"],
  });

  const handleGenerationSuccess = () => {
    toast({
      title: "Timetable Generated",
      description: "The new timetable has been successfully generated.",
    });
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Generate Timetable</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="generate">Generate Timetable</TabsTrigger>
          <TabsTrigger value="courses">Manage Courses</TabsTrigger>
          <TabsTrigger value="instructors">Manage Instructors</TabsTrigger>
          <TabsTrigger value="classrooms">Manage Classrooms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Timetable</CardTitle>
              <CardDescription>
                Create a new timetable using the automatic scheduling system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateTimetableForm 
                courses={courses || []} 
                instructors={instructors || []} 
                classrooms={classrooms || []} 
                constraints={constraints || []}
                onSuccess={handleGenerationSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Manage Courses</CardTitle>
              <CardDescription>
                Add, edit, or remove courses from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm instructors={instructors || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructors">
          <Card>
            <CardHeader>
              <CardTitle>Manage Instructors</CardTitle>
              <CardDescription>
                Add, edit, or remove instructors from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstructorForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classrooms">
          <Card>
            <CardHeader>
              <CardTitle>Manage Classrooms</CardTitle>
              <CardDescription>
                Add, edit, or remove classrooms from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassroomForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Generate;
