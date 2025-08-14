"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useAlertStore, useTicketStore } from '@/store';
import { MoreDotIcon } from "@/components/icons/MoreDotIcon";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const { alerts, fetchAlerts } = useAlertStore();
  const { tickets, fetchTickets } = useTicketStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"Overview" | "Alerts" | "Response">("Overview");
  const [chartData, setChartData] = useState({
    alerts: [0, 0, 0, 0, 0, 0, 0],
    tickets: [0, 0, 0, 0, 0, 0, 0],
    responseTime: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    Promise.all([fetchAlerts(), fetchTickets()]).catch(console.error);
  }, [fetchAlerts, fetchTickets]);

  useEffect(() => {
    // Calculate weekly data for the last 7 days
    const days = 7;
    const alertsData = new Array(days).fill(0);
    const ticketsData = new Array(days).fill(0);
    const responseData = new Array(days).fill(0);

    const now = new Date();
    
    // Process alerts
    alerts.forEach(alert => {
      const alertDate = new Date(alert.created_at);
      const daysDiff = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        alertsData[days - 1 - daysDiff]++;
      }
    });

    // Process tickets  
    tickets.forEach(ticket => {
      const ticketDate = new Date(ticket.created_at);
      const daysDiff = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        ticketsData[days - 1 - daysDiff]++;
        
        // Mock response time data (in real app this would be calculated from actual response times)
        responseData[days - 1 - daysDiff] = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
      }
    });

    setChartData({
      alerts: alertsData,
      tickets: ticketsData,
      responseTime: responseData
    });
  }, [alerts, tickets]);

  const options: ApexOptions = {
    colors: ["#3B82F6", "#EF4444", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.0,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: [
        "6 days ago",
        "5 days ago", 
        "4 days ago",
        "3 days ago",
        "2 days ago",
        "Yesterday",
        "Today"
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
    },
  };

  const getSeriesData = () => {
    switch (selectedTab) {
      case "Alerts":
        return [
          {
            name: "Critical Alerts",
            data: chartData.alerts.map(val => Math.floor(val * 0.3)), // Assume 30% are critical
          },
          {
            name: "Total Alerts", 
            data: chartData.alerts,
          },
        ];
      case "Response":
        return [
          {
            name: "Avg Response Time (min)",
            data: chartData.responseTime,
          },
        ];
      default:
        return [
          {
            name: "Alerts",
            data: chartData.alerts,
          },
          {
            name: "Tickets",
            data: chartData.tickets,
          },
        ];
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Security Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Weekly analytics and trends
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="dropdown-toggle"
            title="Statistics options"
            aria-label="Statistics options menu"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-20 w-40 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Download Report
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View Monthly
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Custom Range
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
          {(["Overview", "Alerts", "Response"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTab === tab
                  ? "bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <ReactApexChart
          options={options}
          series={getSeriesData()}
          type="area"
          height={250}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Alerts</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90">
            {chartData.alerts.reduce((sum, val) => sum + val, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Tickets</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90">
            {chartData.tickets.reduce((sum, val) => sum + val, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90">
            {chartData.responseTime.length > 0 
              ? Math.round(chartData.responseTime.reduce((sum, val) => sum + val, 0) / chartData.responseTime.filter(v => v > 0).length || 0)
              : 0}m
          </p>
        </div>
      </div>
    </div>
  );
}
