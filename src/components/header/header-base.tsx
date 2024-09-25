export default function HeaderBase({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <header
            className="bg-black text-white flex flex-row flex-wrap md:flex-nowrap 
                md:justify-between items-center gap-1 md:gap-5 px-2 pb-3 md:px-8 md:pt-3"
        >
            {children}
        </header>
    )
}
