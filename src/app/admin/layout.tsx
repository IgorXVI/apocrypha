import AdminHeader from "./_components/admin-header"
import AdminFooter from "./_components/admin-footer"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <AdminHeader></AdminHeader>
            <div className="min-h-[80vh] h-full">{children}</div>
            <AdminFooter></AdminFooter>
        </>
    )
}
