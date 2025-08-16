import { ReactNode } from "react";

type ContactLayoutProps = {
  sidebar: ReactNode;
  header?: ReactNode;
  kpis?: ReactNode;
  children: ReactNode;
};

export function ContactLayout({ sidebar, header, kpis, children }: ContactLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">{sidebar}</aside>
          <main className="lg:col-span-2">
            {kpis}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ContactLayout;


