import AdminHeader from "./_components/admin-header"

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col h-screen">
            <AdminHeader></AdminHeader>
            <div className="overflow-y-scroll h-screen">
                <div className="md:mr-[7vw] md:ml-[7vw]">{children}</div>
            </div>
        </div>
    )
}
