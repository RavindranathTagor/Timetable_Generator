// This script will remove all non-CSE related data, keeping only CSE courses, instructors, and classrooms

const baseUrl = "http://localhost:5000";
const coursesUrl = `${baseUrl}/api/courses`;
const instructorsUrl = `${baseUrl}/api/instructors`;
const classroomsUrl = `${baseUrl}/api/classrooms`;

async function cleanup() {
  console.log("Cleaning up non-CSE data...");

  // Delete non-CSE courses
  const allCourses = await fetch(coursesUrl).then(res => res.json());
  for (const course of allCourses) {
    if (course.department !== "CSE") {
      try {
        const response = await fetch(`${coursesUrl}/${course.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log(`Deleted non-CSE course: ${course.code} - ${course.name}`);
        }
      } catch (error) {
        console.error(`Failed to delete course ${course.code}:`, error);
      }
    }
  }
  
  // Delete non-CSE instructors
  const allInstructors = await fetch(instructorsUrl).then(res => res.json());
  for (const instructor of allInstructors) {
    if (instructor.department !== "CSE") {
      try {
        const response = await fetch(`${instructorsUrl}/${instructor.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log(`Deleted non-CSE instructor: ${instructor.name}`);
        }
      } catch (error) {
        console.error(`Failed to delete instructor ${instructor.name}:`, error);
      }
    }
  }
  
  // Delete non-CSE classrooms
  const allClassrooms = await fetch(classroomsUrl).then(res => res.json());
  for (const classroom of allClassrooms) {
    if (!classroom.name.startsWith("CSE")) {
      try {
        const response = await fetch(`${classroomsUrl}/${classroom.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log(`Deleted non-CSE classroom: ${classroom.name}`);
        }
      } catch (error) {
        console.error(`Failed to delete classroom ${classroom.name}:`, error);
      }
    }
  }
  
  console.log("Cleanup complete! Only CSE data remains.");
}

// Run the cleanup
cleanup();