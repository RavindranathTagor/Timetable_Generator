// Generate comprehensive dummy data for all departments
const departments = [
  "PHY", "CHM", "BIO", "MTH", "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "EES", "CES", "ECO"
];

// Base URLs
const baseUrl = "http://localhost:5000";
const instructorsUrl = `${baseUrl}/api/instructors`;
const coursesUrl = `${baseUrl}/api/courses`;

// Department-specific course data
const departmentCourses = {
  "PHY": [
    { code: "PHY 101", name: "Classical Mechanics", credits: 4, capacity: 60 },
    { code: "PHY 201", name: "Electromagnetism", credits: 4, capacity: 50 },
    { code: "PHY 301", name: "Thermodynamics", credits: 3, capacity: 40 },
    { code: "PHY 401", name: "Quantum Mechanics", credits: 4, capacity: 30 }
  ],
  "CHM": [
    { code: "CHM 101", name: "General Chemistry", credits: 4, capacity: 60 },
    { code: "CHM 201", name: "Organic Chemistry", credits: 4, capacity: 50 },
    { code: "CHM 301", name: "Inorganic Chemistry", credits: 3, capacity: 40 },
    { code: "CHM 401", name: "Physical Chemistry", credits: 4, capacity: 35 }
  ],
  "BIO": [
    { code: "BIO 101", name: "Cell Biology", credits: 4, capacity: 60 },
    { code: "BIO 201", name: "Molecular Biology", credits: 4, capacity: 50 },
    { code: "BIO 301", name: "Genetics", credits: 3, capacity: 40 },
    { code: "BIO 401", name: "Ecology", credits: 3, capacity: 35 }
  ],
  "MTH": [
    { code: "MTH 101", name: "Calculus I", credits: 4, capacity: 70 },
    { code: "MTH 201", name: "Linear Algebra", credits: 3, capacity: 60 },
    { code: "MTH 301", name: "Differential Equations", credits: 4, capacity: 50 },
    { code: "MTH 401", name: "Abstract Algebra", credits: 3, capacity: 30 }
  ],
  "CSE": [
    { code: "CSE 101", name: "Introduction to Programming", credits: 4, capacity: 70 },
    { code: "CSE 201", name: "Data Structures", credits: 4, capacity: 60 },
    { code: "CSE 301", name: "Algorithms", credits: 4, capacity: 50 },
    { code: "CSE 401", name: "Operating Systems", credits: 3, capacity: 40 }
  ],
  "ECE": [
    { code: "ECE 101", name: "Circuit Theory", credits: 4, capacity: 60 },
    { code: "ECE 201", name: "Digital Electronics", credits: 4, capacity: 50 },
    { code: "ECE 301", name: "Signals and Systems", credits: 3, capacity: 40 },
    { code: "ECE 401", name: "Communication Systems", credits: 3, capacity: 35 }
  ],
  "MECH": [
    { code: "MECH 101", name: "Engineering Mechanics", credits: 4, capacity: 60 },
    { code: "MECH 201", name: "Thermodynamics", credits: 4, capacity: 50 },
    { code: "MECH 301", name: "Fluid Mechanics", credits: 3, capacity: 45 },
    { code: "MECH 401", name: "Machine Design", credits: 3, capacity: 40 }
  ],
  "CIVIL": [
    { code: "CIVIL 101", name: "Structural Engineering", credits: 4, capacity: 60 },
    { code: "CIVIL 201", name: "Surveying", credits: 3, capacity: 50 },
    { code: "CIVIL 301", name: "Soil Mechanics", credits: 4, capacity: 45 },
    { code: "CIVIL 401", name: "Transportation Engineering", credits: 3, capacity: 40 }
  ],
  "EEE": [
    { code: "EEE 101", name: "Electrical Circuits", credits: 4, capacity: 60 },
    { code: "EEE 201", name: "Power Systems", credits: 4, capacity: 50 },
    { code: "EEE 301", name: "Control Systems", credits: 3, capacity: 45 },
    { code: "EEE 401", name: "Power Electronics", credits: 3, capacity: 40 }
  ],
  "IT": [
    { code: "IT 101", name: "Introduction to Computing", credits: 4, capacity: 70 },
    { code: "IT 201", name: "Database Management", credits: 4, capacity: 60 },
    { code: "IT 301", name: "Web Technologies", credits: 3, capacity: 55 },
    { code: "IT 401", name: "Information Security", credits: 3, capacity: 45 }
  ],
  "EES": [
    { code: "EES 101", name: "Environmental Science", credits: 3, capacity: 60 },
    { code: "EES 201", name: "Pollution Control", credits: 3, capacity: 50 },
    { code: "EES 301", name: "Earth Systems", credits: 4, capacity: 40 },
    { code: "EES 401", name: "Climate Science", credits: 3, capacity: 35 }
  ],
  "CES": [
    { code: "CES 101", name: "Cultural Studies", credits: 3, capacity: 60 },
    { code: "CES 201", name: "Contemporary Issues", credits: 3, capacity: 55 },
    { code: "CES 301", name: "Media Studies", credits: 3, capacity: 45 },
    { code: "CES 401", name: "Cultural Theory", credits: 3, capacity: 40 }
  ],
  "ECO": [
    { code: "ECO 101", name: "Microeconomics", credits: 3, capacity: 70 },
    { code: "ECO 201", name: "Macroeconomics", credits: 3, capacity: 65 },
    { code: "ECO 301", name: "Econometrics", credits: 4, capacity: 50 },
    { code: "ECO 401", name: "International Economics", credits: 3, capacity: 45 }
  ]
};

// Clear existing data (not removing existing instructors and courses)
async function clearExistingData() {
  // We won't delete existing data, just add new data
  console.log("Keeping existing data and adding new records...");
}

// Create instructor data (3 instructors per department)
async function createInstructors() {
  const instructorMap = {};
  
  // Get existing instructors to avoid duplication
  const existingInstructors = await fetch(instructorsUrl).then(res => res.json());
  const existingDepartments = new Set(existingInstructors.map(ins => ins.department));
  
  for (const dept of departments) {
    instructorMap[dept] = [];
    
    // Check if this department already has instructors
    const deptInstructors = existingInstructors.filter(ins => ins.department === dept);
    
    // If we already have instructors for this department, use them
    if (deptInstructors.length > 0) {
      instructorMap[dept] = deptInstructors.map(ins => ins.id);
      console.log(`Using ${deptInstructors.length} existing instructors for ${dept}`);
      continue;
    }
    
    // Otherwise create 3 new instructors for this department
    const titles = ["Prof.", "Dr.", "Assoc. Prof."];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis"];
    
    for (let i = 0; i < 3; i++) {
      const title = titles[i % titles.length];
      const lastName = lastNames[(i + dept.length) % lastNames.length];
      const firstName = String.fromCharCode(65 + i); // A, B, C, etc.
      
      const instructor = {
        name: `${title} ${firstName}. ${lastName}`,
        department: dept,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@iiserb.ac.in`
      };
      
      try {
        const response = await fetch(instructorsUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(instructor)
        });
        
        if (response.ok) {
          const data = await response.json();
          instructorMap[dept].push(data.id);
          console.log(`Added instructor: ${data.name}, ID: ${data.id}, Dept: ${data.department}`);
        } else {
          console.error(`Failed to add instructor for ${dept}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error adding instructor for ${dept}:`, error);
      }
    }
  }
  
  return instructorMap;
}

// Create courses
async function createCourses(instructorMap) {
  // Get existing courses to avoid duplication
  const existingCourses = await fetch(coursesUrl).then(res => res.json());
  const existingCourseCodes = new Set(existingCourses.map(course => course.code));
  
  for (const dept of departments) {
    // Skip if no instructors for this department
    if (!instructorMap[dept] || instructorMap[dept].length === 0) {
      console.warn(`No instructors found for ${dept}, skipping courses`);
      continue;
    }
    
    const coursesToAdd = departmentCourses[dept] || [];
    
    for (let i = 0; i < coursesToAdd.length; i++) {
      const course = coursesToAdd[i];
      
      // Skip if course already exists
      if (existingCourseCodes.has(course.code)) {
        console.log(`Course ${course.code} already exists, skipping`);
        continue;
      }
      
      // Assign an instructor from the department (round-robin)
      const instructorId = instructorMap[dept][i % instructorMap[dept].length];
      
      const courseData = {
        ...course,
        department: dept,
        instructorId: instructorId
      };
      
      try {
        const response = await fetch(coursesUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(courseData)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Added course: ${data.code} - ${data.name}, ID: ${data.id}, Dept: ${data.department}`);
        } else {
          console.error(`Failed to add course ${course.code}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error adding course ${course.code}:`, error);
      }
    }
  }
}

// Main function
async function main() {
  try {
    await clearExistingData();
    const instructorMap = await createInstructors();
    await createCourses(instructorMap);
    console.log("Data generation complete!");
  } catch (error) {
    console.error("Error in data generation:", error);
  }
}

// Run the script
main();