import React, { useState, useEffect } from 'react';
import { 
  ScheduledClassWithDetails, 
  TimetableWithClasses,
  cseSections,
  weekDays,
  timeSlots
} from '@shared/schema';
import { customTimeSlots } from '@/lib/timetable-generator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { exportTimetable } from '@/lib/export-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface CseTimetableViewProps {
  timetable: TimetableWithClasses;
  onExport?: (format: 'pdf' | 'csv' | 'image') => void;
}

interface ScheduleEntry {
  course: string;
  instructor: string;
  room: string;
  section?: string;
}

interface ScheduleCell {
  entries: ScheduleEntry[];
}

interface SectionSchedule {
  [day: string]: {
    [timeSlot: string]: ScheduleCell
  }
}

const CSETimetableView = ({ timetable, onExport }: CseTimetableViewProps) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'image'>('pdf');
  const [activeTab, setActiveTab] = useState('section-view');
  const [schedulesBySection, setSchedulesBySection] = useState<Record<string, SectionSchedule>>({});
  const [visibleSections, setVisibleSections] = useState<string[]>([...cseSections]);

  // Process the timetable data
  useEffect(() => {
    if (!timetable || !timetable.classes) return;

    const newSchedulesBySection: Record<string, SectionSchedule> = {};

    // Initialize sections
    for (const section of cseSections) {
      newSchedulesBySection[section] = {};
      
      // Initialize days
      for (const day of weekDays) {
        newSchedulesBySection[section][day] = {};
        
        // Initialize time slots
        for (const timeSlot of timeSlots) {
          newSchedulesBySection[section][day][timeSlot] = { entries: [] };
        }
      }
    }

    // Group classes by section, day, and time
    for (const cls of timetable.classes) {
      const section = cls.section || 'A'; // Default to A if no section
      const day = cls.day;
      const timeSlot = `${cls.startTime}-${cls.endTime}`;
      
      // Find the matching time slot from our predefined slots or use exact match
      const matchingTimeSlot = timeSlots.find(slot => {
        const [slotStart, slotEnd] = slot.split('-').map(t => t.trim());
        return cls.startTime === slotStart && cls.endTime === slotEnd;
      }) || timeSlot;
      
      // Create or update the schedule entry
      if (!newSchedulesBySection[section][day][matchingTimeSlot]) {
        newSchedulesBySection[section][day][matchingTimeSlot] = { entries: [] };
      }
      
      newSchedulesBySection[section][day][matchingTimeSlot].entries.push({
        course: `${cls.course.code}`,
        instructor: cls.instructor.name.split(' ').pop() || '', // Just last name for space conservation
        room: cls.classroom.name,
        section: cls.section || section // Use the section parameter if cls.section is not available
      });
    }

    setSchedulesBySection(newSchedulesBySection);
  }, [timetable]);

  const handleExport = () => {
    if (onExport) {
      onExport(exportFormat);
    } else {
      // Use the built-in export utility if no custom handler is provided
      exportTimetable(timetable, exportFormat, `timetable-${timetable.name}`);
    }
    setExportDialogOpen(false);
  };

  const toggleSectionVisibility = (section: string) => {
    setVisibleSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {timetable.name} - {timetable.semester}
        </h2>
        <div className="flex space-x-2">
          {/* Section toggle buttons */}
          <div className="flex items-center space-x-3 mr-4">
            {cseSections.map(section => (
              <Button 
                key={section} 
                variant={visibleSections.includes(section) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSectionVisibility(section)}
              >
                Section {section}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setExportDialogOpen(true)}
            variant="outline"
            size="sm"
          >
            Export
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="section-view" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="section-view">Section View</TabsTrigger>
          <TabsTrigger value="consolidated-view">Consolidated View</TabsTrigger>
        </TabsList>

        {/* Section View Tab */}
        <TabsContent value="section-view" className="p-0">
          <div id="timetable-container" className="border rounded-lg p-4 bg-white">
            <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1">
              {/* Header row with days */}
              <div className="font-bold p-2 bg-slate-200">Time / Day</div>
              {weekDays.map(day => (
                <div key={day} className="font-bold p-2 text-center bg-slate-200">
                  {day}
                </div>
              ))}

              {/* Time slots rows */}
              {timeSlots.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                  {/* Time cell */}
                  <div className="p-2 bg-slate-100 font-medium">
                    {timeSlot}
                  </div>

                  {/* Day cells for this time */}
                  {weekDays.map(day => (
                    <div 
                      key={`${day}-${timeSlot}`} 
                      className="border p-1 min-h-[80px] bg-white"
                    >
                      {/* Display entries for all visible sections */}
                      {visibleSections.map(section => (
                        schedulesBySection[section]?.[day]?.[timeSlot]?.entries.map((entry, i) => (
                          <div 
                            key={`${section}-${i}`}
                            className={`text-xs p-1 mb-1 rounded ${
                              section === 'A' ? 'bg-blue-100' : 
                              section === 'B' ? 'bg-green-100' : 
                              'bg-yellow-100'
                            }`}
                          >
                            <div className="font-bold">{entry.course}</div>
                            <div>{entry.instructor}</div>
                            <div className="text-xs text-gray-600">{entry.room}</div>
                            <div className="text-xs font-semibold">Section {section}</div>
                          </div>
                        ))
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Consolidated View Tab - This is the format similar to the screenshot */}
        <TabsContent value="consolidated-view" className="p-0">
          <div id="consolidated-timetable" className="border rounded-lg bg-white overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border p-1">Row</th>
                  {/* Iterate through all buildings/classrooms */}
                  {['CSE Classroom 101', 'CSE Classroom 102', 'CSE Classroom 103'].map(room => (
                    <th key={room} className="border p-1 text-center" colSpan={5}>
                      {room}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-100">
                  <th className="border p-1">Period</th>
                  {/* For each classroom, create 5 columns (one for each day) */}
                  {['CSE Classroom 101', 'CSE Classroom 102', 'CSE Classroom 103'].map(room => (
                    weekDays.map(day => (
                      <th key={`${room}-${day}`} className="border p-1 text-xs">
                        {day.substring(0, 3)}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Time slots */}
                {timeSlots.map((timeSlot, index) => (
                  <tr key={timeSlot} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border p-1 font-medium text-xs">
                      {String.fromCharCode(65 + index)}.&nbsp;{timeSlot}
                    </td>
                    
                    {/* For each classroom */}
                    {['CSE Classroom 101', 'CSE Classroom 102', 'CSE Classroom 103'].map(room => (
                      // For each day of the week
                      weekDays.map(day => {
                        // Find all entries across all sections for this room, day, and time
                        const entries = Object.entries(schedulesBySection)
                          .filter(([section]) => visibleSections.includes(section))
                          .flatMap(([section, schedule]) => 
                            schedule[day]?.[timeSlot]?.entries.filter(e => e.room === room) || []
                          );
                        
                        return (
                          <td 
                            key={`${room}-${day}-${timeSlot}`} 
                            className="border p-1 min-w-[100px]"
                          >
                            {entries.map((entry, i) => (
                              <div 
                                key={i}
                                className={`text-xs p-1 ${
                                  entry.section === 'A' ? 'text-blue-800' : 
                                  entry.section === 'B' ? 'text-green-800' : 
                                  'text-yellow-800'
                                }`}
                              >
                                <div className="font-bold">{entry.course}</div>
                                <div className="text-xs">{entry.instructor}</div>
                                <div className="text-xs">Sec {entry.section}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Timetable</DialogTitle>
            <DialogDescription>
              Choose a format to export the timetable
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'pdf' | 'csv' | 'image')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF Document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV Spreadsheet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image">Image (PNG)</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CSETimetableView;