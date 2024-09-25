import CommerceHeader from "./_components/commerce-header"

export default function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <CommerceHeader></CommerceHeader>
            <div className="md:mr-[7vw] md:ml-[7vw] mt-5">{children}</div>
        </>
    )
}
