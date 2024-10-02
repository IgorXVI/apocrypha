import CommerceFooter from "./_components/commerce-footer"
import CommerceHeader from "./_components/commerce-header"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <CommerceHeader></CommerceHeader>
            {children}
            <CommerceFooter></CommerceFooter>
        </>
    )
}
