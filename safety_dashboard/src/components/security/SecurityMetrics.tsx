"use client";

import { useState, useEffect } from 'react';
import { useAlertStore, useTicketStore } from '@/store';
import Badge from "@/components/ui/Badge";
import { GroupIcon } from "@/components/icons/GroupIcon";
import { TicketIcon } from "@/components/icons/TicketIcon";
import { ArrowUpIcon } from "@/components/icons/ArrowUpIcon";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";

export const SecurityMetrics = () => {
  const { alerts, fetchAlerts } = useAlertStore();
  const { tickets, fetchTickets } = useTicketStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAlerts(), fetchTickets()]);
      } catch (error) {
        console.error('Failed to load metrics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchAlerts, fetchTickets]);

  // Calculate metrics
  const totalUsers = 1247; // This would come from user API
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;

  // Mock growth percentages (these would be calculated from historical data)
  const userGrowth = 8.2;
  const ticketGrowth = -3.1; // Negative is good for tickets (fewer incidents)

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
              <div className="mt-5">
                <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                <div className="w-20 h-8 bg-gray-200 rounded mt-2 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Users Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900">
          <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalUsers.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon className="w-3 h-3" />
            {userGrowth}%
          </Badge>
        </div>
      </div>

      {/* Total Tickets Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900">
          <TicketIcon className="text-orange-600 size-6 dark:text-orange-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Tickets
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalTickets.toLocaleString()}
            </h4>
          </div>
          <Badge color={ticketGrowth < 0 ? "success" : "error"}>
            {ticketGrowth < 0 ? (
              <ArrowDownIcon className="w-3 h-3" />
            ) : (
              <ArrowUpIcon className="w-3 h-3" />
            )}
            {Math.abs(ticketGrowth)}%
          </Badge>
        </div>
      </div>

      {/* Active Tickets Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900">
          <TicketIcon className="text-yellow-600 size-6 dark:text-yellow-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Tickets
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {activeTickets.toLocaleString()}
            </h4>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalTickets > 0 ? Math.round((activeTickets / totalTickets) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {/* Critical Alerts Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900">
          <svg className="text-red-600 size-6 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Critical Alerts
            </span>
            <h4 className="mt-2 font-bold text-red-600 text-title-sm dark:text-red-400">
              {criticalAlerts.toLocaleString()}
            </h4>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Immediate attention
          </div>
        </div>
      </div>
    </div>
  );
};
