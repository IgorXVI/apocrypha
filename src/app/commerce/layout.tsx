import CommerceFooter from "./_components/commerce-footer"
import CommerceHeader from "./_components/commerce-header"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            <CommerceHeader></CommerceHeader>
            <div className="min-h-[80vh] mb-auto">{children}</div>
            <CommerceFooter></CommerceFooter>
        </div>
    )
}
