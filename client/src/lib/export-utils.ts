import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { ScheduledClass, Course, Instructor, Classroom } from '@shared/schema';

// Interface for timetable data with details
interface ScheduledClassWithDetails extends ScheduledClass {
  course?: Course;
  instructor?: Instructor;
  classroom?: Classroom;
}

interface TimetableData {
  id: number;
  name: string;
  semester: string;
  isActive: boolean;
  createdAt: string;
  classes: ScheduledClassWithDetails[];
}

/**
 * Export timetable as an image (PNG)
 */
export const exportTimetableAsImage = async (containerSelector: string, filename: string = 'timetable.png'): Promise<void> => {
  try {
    const element = document.querySelector(containerSelector);
    if (!element) {
      throw new Error(`Element with selector "${containerSelector}" not found`);
    }
    
    const dataUrl = await toPng(element as HTMLElement, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: 'white',
    });
    
    // Save the image
    saveAs(dataUrl, filename);
  } catch (error) {
    console.error('Error exporting timetable as image:', error);
    throw error;
  }
};

/**
 * Export timetable as CSV
 */
export const exportTimetableAsCSV = (timetableData: TimetableData, filename: string = 'timetable.csv'): void => {
  try {
    // CSV header
    let csvContent = 'Day,Start Time,End Time,Course Code,Course Name,Instructor,Room\n';
    
    // Add rows
    for (const cls of timetableData.classes) {
      const row = [
        cls.day,
        cls.startTime,
        cls.endTime,
        cls.course?.code || '',
        cls.course?.name || '',
        cls.instructor?.name || '',
        cls.classroom?.name || ''
      ].map(value => `"${value}"`).join(',');
      
      csvContent += row + '\n';
    }
    
    // Create a blob and save the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting timetable as CSV:', error);
    throw error;
  }
};

/**
 * Export timetable as PDF
 */
export const exportTimetableAsPDF = (timetableData: TimetableData, filename: string = 'timetable.pdf'): void => {
  try {
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${timetableData.name} - ${timetableData.semester}`, 14, 15);
    
    // Add a subtitle
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Weekly timetable
    doc.setFontSize(14);
    doc.text('Weekly Timetable', 14, 32);
    
    // Create a table structure for the weekly view
    const weeklyHeaders = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Prepare data for the weekly view
    const timeSlots = [
      '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
      'Lunch', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
    ];
    
    // Group classes by day and time
    const classesByDayAndTime: Record<string, Record<string, ScheduledClassWithDetails[]>> = {};
    
    for (const cls of timetableData.classes) {
      if (!classesByDayAndTime[cls.day]) {
        classesByDayAndTime[cls.day] = {};
      }
      
      const timeKey = `${cls.startTime}-${cls.endTime}`;
      if (!classesByDayAndTime[cls.day][timeKey]) {
        classesByDayAndTime[cls.day][timeKey] = [];
      }
      
      classesByDayAndTime[cls.day][timeKey].push(cls);
    }
    
    // Prepare data for the weekly table
    const weeklyData = timeSlots.map(timeSlot => {
      const rowData = [timeSlot];
      
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
        // Special case for lunch
        if (timeSlot === 'Lunch') {
          rowData.push('LUNCH BREAK');
          continue;
        }
        
        // Find classes at this time slot
        let cellContent = '';
        for (const [timeKey, classes] of Object.entries(classesByDayAndTime[day] || {})) {
          // Check if the time ranges overlap
          const [classStart, classEnd] = timeKey.split('-');
          const [slotStart, slotEnd] = timeSlot.split('-');
          
          if (classStart === slotStart) {
            cellContent = classes.map(cls => 
              `${cls.course?.code}\n${cls.classroom?.name}`
            ).join('\n');
          }
        }
        
        rowData.push(cellContent);
      }
      
      return rowData;
    });
    
    // Add the weekly table
    autoTable(doc, {
      head: [weeklyHeaders],
      body: weeklyData,
      startY: 35,
      styles: {
        cellPadding: 2,
        fontSize: 8,
        overflow: 'linebreak',
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [0, 51, 102], // #003366
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 255]
      }
    });
    
    // Course list with details
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Course Details', 14, 15);
    
    // Group classes by department
    const classesByDepartment: Record<string, ScheduledClassWithDetails[]> = {};
    
    for (const cls of timetableData.classes) {
      const dept = cls.course?.department || 'Unknown';
      
      if (!classesByDepartment[dept]) {
        classesByDepartment[dept] = [];
      }
      
      classesByDepartment[dept].push(cls);
    }
    
    // Headers for course details
    const courseHeaders = ['Course Code', 'Course Name', 'Instructor', 'Schedule', 'Room', 'Capacity'];
    
    // Start position for the first department table
    let yPos = 20;
    
    // Add tables for each department
    for (const [dept, classes] of Object.entries(classesByDepartment)) {
      // Add department header
      doc.setFontSize(12);
      doc.text(`${dept} Department`, 14, yPos);
      yPos += 5;
      
      // Prepare data for this department
      const departmentData = classes.map(cls => [
        cls.course?.code || '',
        cls.course?.name || '',
        cls.instructor?.name || '',
        `${cls.day} ${cls.startTime}-${cls.endTime}`,
        cls.classroom?.name || '',
        cls.course?.capacity?.toString() || ''
      ]);
      
      // Add the department table
      autoTable(doc, {
        head: [courseHeaders],
        body: departmentData,
        startY: yPos,
        styles: {
          cellPadding: 2,
          fontSize: 8,
          overflow: 'linebreak',
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: getDepartmentColor(dept),
          textColor: [0, 0, 0]
        }
      });
      
      // Update yPos for the next department
      // @ts-ignore (lastAutoTable is not in types but exists)
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
    }
    
    // Save the file
    doc.save(filename);
  } catch (error) {
    console.error('Error exporting timetable as PDF:', error);
    throw error;
  }
};

/**
 * Get color for a department
 */
function getDepartmentColor(dept: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    'PHY': [255, 204, 204], // #FFCCCC
    'CHM': [204, 255, 204], // #CCFFCC
    'BIO': [204, 204, 255], // #CCCCFF
    'MTH': [255, 242, 204], // #FFF2CC
    'EES': [255, 224, 204], // #FFE0CC
    'CES': [230, 204, 255], // #E6CCFF
    'ECO': [204, 255, 255], // #CCFFFF
    'Unknown': [230, 230, 230] // #E6E6E6
  };
  
  return colors[dept] || colors['Unknown'];
}

/**
 * Export the timetable in the specified format
 */
export const exportTimetable = async (
  timetableData: TimetableData, 
  format: 'pdf' | 'csv' | 'image' = 'pdf',
  containerSelector?: string
): Promise<void> => {
  const filename = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.semester.replace(/\s+/g, '_')}`;
  
  switch (format) {
    case 'pdf':
      exportTimetableAsPDF(timetableData, `${filename}.pdf`);
      break;
    case 'csv':
      exportTimetableAsCSV(timetableData, `${filename}.csv`);
      break;
    case 'image':
      if (!containerSelector) {
        throw new Error('Container selector is required for image export');
      }
      await exportTimetableAsImage(containerSelector, `${filename}.png`);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
