import HeaderLinks from "./header-links"

export default function DesktopHeaderNav() {
    return (
        <nav className="hidden md:flex flex-row gap-8">
            <HeaderLinks />
        </nav>
    )
}
