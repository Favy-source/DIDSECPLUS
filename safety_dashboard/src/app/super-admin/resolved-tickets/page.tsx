import TicketsContent from '@/components/tickets/TicketsContent';
import mockTickets from '@/data/mockTickets';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <TicketsContent initialTickets={mockTickets} defaultStatus="resolved" />
          </div>
        </main>
      </div>
    </div>
  );
}
