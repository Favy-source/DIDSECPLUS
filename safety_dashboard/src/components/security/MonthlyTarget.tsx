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

export default function MonthlyTarget() {
  const { tickets, fetchTickets } = useTicketStore();
  const [isOpen, setIsOpen] = useState(false);
  const [closureRate, setClosureRate] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({
    closed: 0,
    total: 0,
    target: 85 // Target 85% closure rate
  });

  useEffect(() => {
    fetchTickets().catch(console.error);
  }, [fetchTickets]);

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
    });

    const closedTickets = monthlyTickets.filter(ticket => 
      ticket.status === 'resolved' || ticket.status === 'closed'
    );

    const rate = monthlyTickets.length > 0 
      ? Math.round((closedTickets.length / monthlyTickets.length) * 100)
      : 0;

    setClosureRate(rate);
    setMonthlyStats({
      closed: closedTickets.length,
      total: monthlyTickets.length,
      target: 85
    });
  }, [tickets]);

  const series = [closureRate];
  
  const options: ApexOptions = {
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#3B82F6"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Closure Rate"],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const getPerformanceColor = () => {
    if (closureRate >= monthlyStats.target) return "text-green-600";
    if (closureRate >= monthlyStats.target * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceText = () => {
    if (closureRate >= monthlyStats.target) return "+10%";
    if (closureRate >= monthlyStats.target * 0.8) return "0%";
    return `-${Math.abs(closureRate - monthlyStats.target)}%`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Ticket closure rate for current month
            </p>
          </div>

          <div className="relative inline-block">
            <button 
              onClick={toggleDropdown} 
              className="dropdown-toggle"
              title="Target options"
              aria-label="Target options menu"
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
                  Set Target
                </button>
                <button
                  onClick={closeDropdown}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Export Report
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ReactApexChart
            options={options}
            series={series}
            type="radialBar"
            height={330}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            You closed {monthlyStats.closed} out of {monthlyStats.total} tickets this month.
            {closureRate >= monthlyStats.target 
              ? " Excellent performance!" 
              : ` Need ${monthlyStats.target - closureRate}% more to reach target.`
            }
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Target</p>
              <p className="font-semibold text-gray-800 dark:text-white/90">
                {monthlyStats.target}% ↓
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Current</p>
              <p className="font-semibold text-gray-800 dark:text-white/90">
                {closureRate}% ↑
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Performance</p>
              <p className={`font-semibold ${getPerformanceColor()}`}>
                {getPerformanceText()} ↑
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
