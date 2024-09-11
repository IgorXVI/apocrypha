import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function Nav() {
    return (
        <nav className="flex gap-2 flex-row justify-between border-b w-screen p-5 bg-black">
            <p>Hamburguer</p>
            <SignedIn>
                <UserButton></UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton></SignInButton>
            </SignedOut>
        </nav>
    )
}
