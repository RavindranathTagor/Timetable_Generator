import { useQuery } from "@tanstack/react-query";

const Footer = () => {
  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  return (
    <footer className="bg-gray-100 border-t mt-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} IISERB Timetable Generator {activeTimetable && `| ${activeTimetable.semester}`}
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Help</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Documentation</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
