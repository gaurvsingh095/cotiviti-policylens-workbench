import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({
  page,
  setPage,
  children,
}: {
  page: string;
  setPage: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden md:block">
        <Sidebar page={page} setPage={setPage} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header page={page} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6 fade-in" key={page}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
