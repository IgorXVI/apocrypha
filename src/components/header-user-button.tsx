import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function HeaderUserButton() {
    return (
        <>
            <SignedIn>
                <UserButton></UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton></SignInButton>
            </SignedOut>
        </>
    )
}
