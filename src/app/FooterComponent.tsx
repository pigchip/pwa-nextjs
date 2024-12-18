import React from "react";
import { useRouter, usePathname } from "next/navigation";
import NavigationIcon from "@mui/icons-material/Navigation";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import MapIcon from "@mui/icons-material/Map";
import WarningIcon from "@mui/icons-material/Warning"; // Import the new icon
import { useRole } from "@/contexts/RoleContext";
import { AdminPanelSettings, TouchApp } from "@mui/icons-material";

const FooterComponent: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { role } = useRole(); // Get the current role

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getButtonClass = (paths: string | string[]) => {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.some((path) => currentPath.startsWith(path))
      ? "text-[#6ABDA6] border-t-4 border-[#6ABDA6]"
      : "text-black";
  };

  return (
    <footer className="flex justify-between bg-gray-100 flex-shrink-0 w-full">
      {role === "user" && (
        <>
          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/navigation")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                "/navigation"
              )}`}
            >
              <NavigationIcon className="mt-2" />
            </button>
          </div>

          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/search-history")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                "/search-history"
              )}`}
            >
              <BookmarkIcon className="mt-2" />
            </button>
          </div>

          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/reports")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                ["/reports", "/reports/create", "/reports/status"]
              )}`}
            >
              <AssignmentIcon className="mt-2" />
            </button>
          </div>

          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/interactive-map")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                "/interactive-map"
              )}`}
            >
              <TouchApp className="mt-2" />
            </button>
          </div>

          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/listed-map")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                "/listed-map"
              )}`}
            >
              <MapIcon className="mt-2" />
            </button>
          </div>
        </>
      )}

      {(role === "supervisor" || role === "admin") && (
        <>
          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/supervisor")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                ["/supervisor", "/reports/details"]
              )}`}
            >
              <AssignmentIcon className="mt-2" />
            </button>
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div className="flex-1 relative">
            <button
              onClick={() => handleNavigation("/admin/supervisors")}
              className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
                ["/admin/supervisors", "/admin/supervisors/", "/admin/supervisors/new"]
              )}`}
            >
              <AdminPanelSettings className="mt-2" />
            </button>
          </div>
        </>
      )}

      <div className="flex-1 relative">
        <button
          onClick={() => handleNavigation("/incidents")}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
            "/incidents"
          )}`}
        >
          <WarningIcon className="mt-2" /> {/* Use the new icon */}
        </button>
      </div>

      <div className="flex-1 relative">
        <button
          onClick={() => handleNavigation("/settings")}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(
            ["/settings", "/most-visited"]
          )}`}
        >
          <SettingsIcon className="mt-2" />
        </button>
      </div>
    </footer>
  );
};

export default FooterComponent;