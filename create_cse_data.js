// This script will clear existing data and create CSE-specific data

const baseUrl = "http://localhost:5000";
const instructorsUrl = `${baseUrl}/api/instructors`;
const coursesUrl = `${baseUrl}/api/courses`;
const classroomsUrl = `${baseUrl}/api/classrooms`;

// CSE Professor data
const cseProfessors = [
  {
    name: "Dr. Rajesh Kumar",
    department: "CSE",
    email: "rajesh.kumar@cse.iiserb.ac.in"
  },
  {
    name: "Prof. Anita Sharma",
    department: "CSE",
    email: "anita.sharma@cse.iiserb.ac.in"
  },
  {
    name: "Dr. Manoj Tiwari",
    department: "CSE",
    email: "manoj.tiwari@cse.iiserb.ac.in"
  },
  {
    name: "Dr. Priya Singh",
    department: "CSE",
    email: "priya.singh@cse.iiserb.ac.in"
  },
  {
    name: "Prof. Vijay Gupta",
    department: "CSE",
    email: "vijay.gupta@cse.iiserb.ac.in"
  },
  {
    name: "Dr. Sunita Patel",
    department: "CSE",
    email: "sunita.patel@cse.iiserb.ac.in"
  }
];

// CSE Courses data
const cseCourses = [
  {
    code: "CSE101",
    name: "Introduction to Computer Science",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE102",
    name: "Programming Fundamentals",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE201",
    name: "Data Structures",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE202",
    name: "Algorithms",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE203",
    name: "Object-Oriented Programming",
    department: "CSE",
    credits: 3,
    capacity: 60
  },
  {
    code: "CSE301",
    name: "Database Management Systems",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE302",
    name: "Operating Systems",
    department: "CSE",
    credits: 4,
    capacity: 60
  },
  {
    code: "CSE303",
    name: "Computer Networks",
    department: "CSE",
    credits: 3,
    capacity: 60
  },
  {
    code: "CSE401",
    name: "Artificial Intelligence",
    department: "CSE",
    credits: 3,
    capacity: 40
  },
  {
    code: "CSE402",
    name: "Web Technologies",
    department: "CSE",
    credits: 3,
    capacity: 40
  },
  {
    code: "CSE403",
    name: "Machine Learning",
    department: "CSE",
    credits: 4,
    capacity: 40
  },
  {
    code: "CSE404",
    name: "Computer Graphics",
    department: "CSE",
    credits: 3,
    capacity: 40
  }
];

// CSE Classrooms & Labs
const cseClassrooms = [
  {
    name: "CSE Classroom 101",
    building: "CSE Building",
    capacity: 70
  },
  {
    name: "CSE Classroom 102",
    building: "CSE Building",
    capacity: 70
  },
  {
    name: "CSE Classroom 103",
    building: "CSE Building",
    capacity: 70
  },
  {
    name: "CSE Lab 1",
    building: "CSE Building",
    capacity: 40
  },
  {
    name: "CSE Lab 2",
    building: "CSE Building",
    capacity: 40
  },
  {
    name: "CSE Lab 3",
    building: "CSE Building",
    capacity: 40
  }
];

// Clear existing data and add CSE-specific data
async function setupCSEData() {
  try {
    console.log("Clearing existing data and setting up CSE department data...");
    
    // Clear existing data
    await clearExistingData();
    
    // Add CSE professors
    const professorIds = await addProfessors();
    
    // Add CSE courses with professors assigned
    await addCourses(professorIds);
    
    // Add CSE classrooms and labs
    await addClassrooms();
    
    console.log("CSE department setup complete!");
  } catch (error) {
    console.error("Error setting up CSE data:", error);
  }
}

// Delete existing data
async function clearExistingData() {
  // Get all instructors
  const allInstructors = await fetch(instructorsUrl).then(res => res.json());
  // Get all courses
  const allCourses = await fetch(coursesUrl).then(res => res.json());
  // Get all classrooms
  const allClassrooms = await fetch(classroomsUrl).then(res => res.json());
  
  // Delete non-CSE instructors
  for (const instructor of allInstructors) {
    if (instructor.department !== "CSE") {
      try {
        const response = await fetch(`${instructorsUrl}/${instructor.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log(`Deleted instructor: ${instructor.name}`);
        }
      } catch (error) {
        console.error(`Failed to delete instructor ${instructor.name}:`, error);
      }
    }
  }
  
  // Delete all courses
  for (const course of allCourses) {
    try {
      const response = await fetch(`${coursesUrl}/${course.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log(`Deleted course: ${course.code}`);
      }
    } catch (error) {
      console.error(`Failed to delete course ${course.code}:`, error);
    }
  }
  
  // Delete all classrooms
  for (const classroom of allClassrooms) {
    try {
      const response = await fetch(`${classroomsUrl}/${classroom.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log(`Deleted classroom: ${classroom.name}`);
      }
    } catch (error) {
      console.error(`Failed to delete classroom ${classroom.name}:`, error);
    }
  }
  
  console.log("Existing data cleared.");
}

// Add CSE professors
async function addProfessors() {
  const professorIds = [];
  
  for (const professor of cseProfessors) {
    try {
      const response = await fetch(instructorsUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(professor)
      });
      
      if (response.ok) {
        const data = await response.json();
        professorIds.push(data.id);
        console.log(`Added professor: ${data.name}, ID: ${data.id}`);
      } else {
        console.error(`Failed to add professor ${professor.name}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error adding professor ${professor.name}:`, error);
    }
  }
  
  return professorIds;
}

// Add CSE courses
async function addCourses(professorIds) {
  for (let i = 0; i < cseCourses.length; i++) {
    const course = cseCourses[i];
    const instructorId = professorIds[i % professorIds.length];
    
    try {
      const response = await fetch(coursesUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...course,
          instructorId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Added course: ${data.code} - ${data.name}, assigned to instructor ID: ${instructorId}`);
      } else {
        console.error(`Failed to add course ${course.code}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error adding course ${course.code}:`, error);
    }
  }
}

// Add CSE classrooms and labs
async function addClassrooms() {
  for (const classroom of cseClassrooms) {
    try {
      const response = await fetch(classroomsUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(classroom)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Added classroom: ${data.name}, ID: ${data.id}`);
      } else {
        console.error(`Failed to add classroom ${classroom.name}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error adding classroom ${classroom.name}:`, error);
    }
  }
}

// Run the setup
setupCSEData();