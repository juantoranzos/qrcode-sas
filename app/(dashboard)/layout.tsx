export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar fijo a la izquierda */}
            <div className="fixed inset-y-0 flex w-64 flex-col">
                <DashboardSidebar />
            </div>

            {/* Contenido principal a la derecha del sidebar */}
            <main className="pl-64 flex-1">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Import dynamic para evitar conflictos pesados de servidor si no es necesario al principio
import { DashboardSidebar } from "@/app/components/dashboard/Sidebar";
