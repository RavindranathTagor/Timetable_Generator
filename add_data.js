// Create instructors and courses for all departments
const departments = [
  "MTH", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "EES", "CES", "ECO"
];

// Base URLs
const baseUrl = "http://localhost:5000";
const instructorsUrl = `${baseUrl}/api/instructors`;
const coursesUrl = `${baseUrl}/api/courses`;

// Create instructor data
const instructors = departments.map((dept, index) => ({
  name: `Dr. ${String.fromCharCode(67 + index)} Johnson`,
  department: dept,
  email: `${dept.toLowerCase()}.prof@iiserb.ac.in`
}));

// Add instructors
async function addInstructors() {
  const currentInstructors = await fetch(`${instructorsUrl}`).then(res => res.json());
  const startId = currentInstructors.length + 1;
  
  for (let i = 0; i < instructors.length; i++) {
    const instructor = instructors[i];
    try {
      const response = await fetch(instructorsUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(instructor)
      });
      const data = await response.json();
      console.log(`Added instructor: ${data.name}, ID: ${data.id}`);
    } catch (error) {
      console.error(`Error adding instructor for ${instructor.department}:`, error);
    }
  }
  
  return startId;
}

// Add courses
async function addCourses(startInstructorId) {
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    const instructorId = startInstructorId + i;
    
    // Create 2 courses per department
    const courses = [
      {
        code: `${dept} 101`,
        name: `Introduction to ${dept}`,
        department: dept,
        instructorId: instructorId,
        credits: 3,
        capacity: 40
      },
      {
        code: `${dept} 201`,
        name: `Advanced ${dept}`,
        department: dept,
        instructorId: instructorId,
        credits: 4,
        capacity: 30
      }
    ];
    
    for (const course of courses) {
      try {
        const response = await fetch(coursesUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(course)
        });
        const data = await response.json();
        console.log(`Added course: ${data.code}, ID: ${data.id}`);
      } catch (error) {
        console.error(`Error adding course for ${dept}:`, error);
      }
    }
  }
}

// Run the process
async function init() {
  const startInstructorId = await addInstructors();
  await addCourses(startInstructorId);
  console.log("All data has been added!");
}

init();