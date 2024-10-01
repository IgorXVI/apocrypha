import AdminHeader from "./_components/admin-header"
import AdminFooter from "./_components/admin-footer"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <AdminHeader></AdminHeader>
            <div className="md:mr-[7vw] md:ml-[7vw] mt-5 mb-auto min-h-screen">{children}</div>
            <AdminFooter></AdminFooter>
        </>
    )
}
