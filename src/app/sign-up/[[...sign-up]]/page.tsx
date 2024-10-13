import { SignUp } from "@clerk/nextjs"

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-neutral-950 to-neutral-700 bg-black">
            <h1 className="text-white mb-16 text-6xl font-extrabold">Apocrypha</h1>
            <SignUp forceRedirectUrl="/commerce" />
        </div>
    )
}
