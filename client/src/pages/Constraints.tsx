import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ConstraintForm from "@/components/forms/ConstraintForm";
import { Constraint } from "@shared/schema";

const Constraints = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddConstraint, setShowAddConstraint] = useState(false);
  const [constraintToDelete, setConstraintToDelete] = useState<number | null>(null);
  
  const { data: constraints, isLoading } = useQuery({
    queryKey: ["/api/constraints"],
  });
  
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });
  
  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
  });
  
  const { data: classrooms } = useQuery({
    queryKey: ["/api/classrooms"],
  });
  
  const deleteConstraintMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/constraints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/constraints"] });
      toast({
        title: "Constraint Deleted",
        description: "The constraint has been removed successfully.",
      });
      setConstraintToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete constraint. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteConstraint = (id: number) => {
    setConstraintToDelete(id);
  };
  
  const confirmDeleteConstraint = () => {
    if (constraintToDelete !== null) {
      deleteConstraintMutation.mutate(constraintToDelete);
    }
  };
  
  const getEntityName = (constraint: Constraint) => {
    if (constraint.type === "instructor_unavailable") {
      const instructor = instructors?.find(i => i.id === constraint.entityId);
      return instructor ? instructor.name : `Instructor ${constraint.entityId}`;
    } else if (constraint.type === "room_unavailable") {
      const classroom = classrooms?.find(c => c.id === constraint.entityId);
      return classroom ? classroom.name : `Room ${constraint.entityId}`;
    } else if (constraint.type === "course_conflict") {
      const course = courses?.find(c => c.id === constraint.entityId);
      return course ? course.code : `Course ${constraint.entityId}`;
    }
    return `Entity ${constraint.entityId}`;
  };
  
  const getConstraintDescription = (constraint: Constraint) => {
    if (constraint.type === "instructor_unavailable") {
      return `Instructor unavailable on ${constraint.day} at ${constraint.timeSlot}`;
    } else if (constraint.type === "room_unavailable") {
      return `Room unavailable on ${constraint.day} at ${constraint.timeSlot}`;
    } else if (constraint.type === "course_conflict") {
      // In this case, timeSlot is used to store the conflicting course ID
      const conflictingCourse = courses?.find(c => c.id === parseInt(constraint.timeSlot));
      const courseName = conflictingCourse ? conflictingCourse.code : constraint.timeSlot;
      return `Course conflict with ${courseName}`;
    }
    return `${constraint.type} constraint on ${constraint.day} at ${constraint.timeSlot}`;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scheduling Constraints</h1>
        <Button 
          onClick={() => setShowAddConstraint(true)}
          className="bg-primary hover:bg-primary/80"
        >
          Add Constraint
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Constraints</CardTitle>
          <CardDescription>
            Define constraints to prevent scheduling conflicts such as instructor unavailability,
            room restrictions, or course dependencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading constraints...</div>
          ) : constraints?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {constraints.map((constraint) => (
                  <TableRow key={constraint.id}>
                    <TableCell className="font-medium capitalize">
                      {constraint.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{getEntityName(constraint)}</TableCell>
                    <TableCell>{getConstraintDescription(constraint)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConstraint(constraint.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No constraints defined yet. Add constraints to prevent scheduling conflicts.
            </div>
          )}
        </CardContent>
      </Card>
      
      {showAddConstraint && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Add New Constraint</CardTitle>
            <CardDescription>
              Define a new scheduling constraint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConstraintForm 
              courses={courses || []}
              instructors={instructors || []}
              classrooms={classrooms || []}
              onSuccess={() => setShowAddConstraint(false)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowAddConstraint(false)}
              className="mr-2"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <AlertDialog open={constraintToDelete !== null} onOpenChange={(open) => !open && setConstraintToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this constraint. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteConstraint}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Constraints;
