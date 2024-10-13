import { SignUp } from "@clerk/nextjs"

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-tentacles-mobile md:bg-tentacles bg-cover bg-black">
            <h1 className="text-white mb-16 text-6xl font-extrabold">Apocrypha</h1>
            <SignUp forceRedirectUrl="/commerce" />
        </div>
    )
}
