import AdminHeader from "./_components/admin-header"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            <AdminHeader></AdminHeader>
            <div className="md:mr-[7vw] md:ml-[7vw]">{children}</div>
        </div>
    )
}
