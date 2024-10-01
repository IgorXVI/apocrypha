import CommerceFooter from "./_components/commer-footer"
import CommerceHeader from "./_components/commerce-header"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            <CommerceHeader></CommerceHeader>
            <div className="md:mr-[7vw] md:ml-[7vw] mt-5 mb-auto min-h-screen">{children}</div>
            <CommerceFooter></CommerceFooter>
        </div>
    )
}
