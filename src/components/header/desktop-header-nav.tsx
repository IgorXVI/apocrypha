import { headerLinks } from "./header-links"

export default function DesktopHeaderNav() {
    return <nav className="hidden md:flex space-x-4">{...headerLinks}</nav>
}
