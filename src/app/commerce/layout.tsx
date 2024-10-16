import CommerceFooter from "./_components/commerce-footer"
import CommerceHeader from "./_components/commerce-header"
import StoreProvider from "~/components/redux/StoreProvider"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <StoreProvider>
            <CommerceHeader></CommerceHeader>
            <div className="min-h-[80vh] mb-auto">{children}</div>
            <CommerceFooter></CommerceFooter>
        </StoreProvider>
    )
}
