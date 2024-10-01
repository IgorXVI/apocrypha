import CompanyIconButton from "~/components/header/company-icon-button"
import DesktopHeaderNav from "~/components/header/desktop-header-nav"
import HeaderBase from "~/components/header/header-base"
import HeaderUserButton from "~/components/header/header-user-button"
import MenuSheet from "~/components/header/menu-sheet"

export default function AdminHeader() {
    return (
        <HeaderBase>
            <div className="flex gap-1 md:gap-3 justify-center items-center mr-auto">
                <MenuSheet></MenuSheet>
                <CompanyIconButton></CompanyIconButton>
                <div className="ml-10">
                    <DesktopHeaderNav></DesktopHeaderNav>
                </div>
            </div>

            <div className="flex justify-center gap-6 items-center p-2">
                <HeaderUserButton></HeaderUserButton>
            </div>
        </HeaderBase>
    )
}
