import AdminHeader from "./_components/admin-header"
import AdminFooter from "./_components/admin-footer"
import StoreProvider from "~/components/redux/StoreProvider"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <StoreProvider>
            <AdminHeader></AdminHeader>
            <div className="min-h-[80vh] mb-auto container mx-auto">{children}</div>
            <AdminFooter></AdminFooter>
        </StoreProvider>
    )
}
