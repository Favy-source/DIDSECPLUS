"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
  GridIcon,
} from "../icons"; // <-- all icons from the barrel

// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Emergency Alerts",
    subItems: [
      { name: "All Alerts", path: "/super-admin/alerts", pro: false },
      { name: "Active Alerts", path: "/super-admin/alerts/active", pro: false },
      { name: "Alert History", path: "/super-admin/alerts/history", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Tickets",
    subItems: [
      { name: "All Tickets", path: "/tickets", pro: false },
      { name: "Create Ticket", path: "/tickets/create", pro: false },
      { name: "Open Tickets", path: "/tickets/open", pro: false },
      { name: "Resolved Tickets", path: "/tickets/resolved", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Location Tracking",
    subItems: [
      { name: "Security Map", path: "/super-admin/location/securitymap", pro: false },
      { name: "State Analysis", path: "/super-admin/location/state-analysis", pro: false },
      { name: "LGA Coverage", path: "/super-admin/location/lga-coverage", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    subItems: [
      { name: "All Users", path: "/super-admin/users/allusers", pro: false },
      { name: "User Roles", path: "/super-admin/users/userroles", pro: false },
      { name: "User Analytics", path: "/super-admin/users/useranalytics", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Police",
    subItems: [
      { name: "Branch Directory", path: "/police/dashboard", pro: false },
      { name: "Assignments", path: "/police/dashboard/assignments", pro: false },
      { name: "Performance", path: "/police/dashboard/performance", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Reports",
    subItems: [
      { name: "Monthly Reports", path: "/reports/monthly", pro: false },
      { name: "Analytics", path: "/reports/analytics", pro: false },
      { name: "Export Data", path: "/reports/export", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "System",
    subItems: [
      { name: "System Health", path: "/system/health", pro: false },
      { name: "Audit Logs", path: "/system/audit", pro: false },
      { name: "Settings", path: "/system/settings", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Admin Profile",
    subItems: [
      { name: "Profile Settings", path: "/profile", pro: false },
      { name: "Security", path: "/profile/security", pro: false },
      { name: "Logout", path: "/logout", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, hideOnCollapse } = useSidebar();
  const pathname = usePathname();

  // If current route is within super-admin, prefix sidebar links so they open under /super-admin
  const basePath = pathname?.startsWith('/super-admin') ? '/super-admin' : '';
  const buildPath = (p?: string) => {
    if (!p) return p;
    if (p.startsWith('/super-admin')) return p;
    return `${basePath}${p}`;
  };

  // If the sidebar was collapsed via the hamburger, prevent hover from showing it
  const effectiveHovered = isHovered && !hideOnCollapse;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Expand the matching submenu based on current route
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          const full = buildPath(subItem.path);
          if (isActive(full || '')) {
            setOpenSubmenu({ type: menuType, index });
            submenuMatched = true;
          }
        });
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: el.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const renderMenuItems = (list: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {list.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !effectiveHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || effectiveHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || effectiveHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              (() => {
                const fullPath = buildPath(nav.path);
                return (
                  <Link
                    href={fullPath || nav.path}
                    className={`menu-item group ${
                      isActive(fullPath || nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                    }`}
                  >
                    <span
                      className={`${
                        isActive(fullPath || nav.path)
                          ? 'menu-item-icon-active'
                          : 'menu-item-icon-inactive'
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || effectiveHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                );
              })()
            )
          )}
          {nav.subItems && (isExpanded || effectiveHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {(() => {
                      const fullSub = buildPath(subItem.path);
                      return (
                        <Link
                          href={fullSub || subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(fullSub || subItem.path)
                              ? 'menu-dropdown-item-active'
                              : 'menu-dropdown-item-inactive'
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(buildPath(subItem.path) || subItem.path)
                                    ? 'menu-dropdown-badge-active'
                                    : 'menu-dropdown-badge-inactive'
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(buildPath(subItem.path) || subItem.path)
                                    ? 'menu-dropdown-badge-active'
                                    : 'menu-dropdown-badge-inactive'
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // New: determine visibility for desktop collapsed state
  const isVisible = isExpanded || effectiveHovered || isMobileOpen;

  // Expose sidebar width as a CSS variable so other components (map/main) can offset themselves
  React.useEffect(() => {
    try {
      const width = isVisible ? "290px" : "0px";
      document.documentElement.style.setProperty("--sidebar-width", width);
    } catch (e) {
      // noop in non-browser environments
    }
  }, [isVisible]);

  return (
    <aside
      className={`fixed top-16 flex flex-col px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 isolate pointer-events-auto
        ${isVisible ? "w-[290px]" : "w-0"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${isExpanded || isHovered ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
      style={{ zIndex: 9999 }}
      onMouseEnter={() => {
        if (!isExpanded && !hideOnCollapse) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Security Operations" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Administration" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
