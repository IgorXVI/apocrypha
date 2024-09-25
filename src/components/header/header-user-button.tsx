import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function HeaderUserButton() {
    return (
        <div className="flex items-center justify-center mt-1">
            <SignedIn>
                <UserButton></UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton></SignInButton>
            </SignedOut>
        </div>
    )
}
