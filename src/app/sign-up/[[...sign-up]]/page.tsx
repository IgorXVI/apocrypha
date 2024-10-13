import { SignUp } from "@clerk/nextjs"

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-tentacles-mobile md:bg-tentacles bg-cover bg-black">
            <h1>Apocrypha</h1>
            <SignUp forceRedirectUrl="/commerce" />
        </div>
    )
}
