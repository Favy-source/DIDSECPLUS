"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTicketStore } from '@/store';
import { MoreDotIcon } from "@/components/icons/MoreDotIcon";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTicketsChart() {
  const { tickets, fetchTickets } = useTicketStore();
  const [isOpen, setIsOpen] = useState(false);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    fetchTickets().catch(console.error);
  }, [fetchTickets]);

  useEffect(() => {
    // Calculate monthly ticket data
    const monthlyData = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    tickets.forEach(ticket => {
      const ticketDate = new Date(ticket.created_at);
      if (ticketDate.getFullYear() === currentYear) {
        const month = ticketDate.getMonth();
        monthlyData[month]++;
      }
    });

    setChartData(monthlyData);
  }, [tickets]);

  const options: ApexOptions = {
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb", 
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
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
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} tickets`,
      },
    },
  };

  const series = [
    {
      name: "Tickets Received",
      data: chartData,
    },
  ];

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
            Monthly Tickets
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Emergency tickets received each month
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="dropdown-toggle"
            title="Chart options"
            aria-label="Chart options menu"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-20 w-40 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View Details
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export Data
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
}
