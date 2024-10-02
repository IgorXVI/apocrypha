import { headerLinks } from "./header-links"

export default function DesktopHeaderNav() {
    return <nav className="hidden md:flex flex-row gap-8">{...headerLinks}</nav>
}
