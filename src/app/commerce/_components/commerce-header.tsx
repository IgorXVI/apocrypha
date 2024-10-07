import HeaderBase from "~/components/header/header-base"
import HeaderUserButton from "~/components/header/header-user-button"
import MenuSheet from "~/components/header/menu-sheet"
import ProductSearch from "./product-search"
import CompanyIconButton from "~/components/header/company-icon-button"
import UserAddress from "./user-address"
import CartButton from "./cart-button"
import DesktopHeaderNav from "~/components/header/desktop-header-nav"

export default function CommerceHeader() {
    return (
        <>
            <HeaderBase>
                <div className="flex gap-1 md:gap-3 justify-center items-center mr-auto md:mr-0">
                    <MenuSheet></MenuSheet>
                    <CompanyIconButton></CompanyIconButton>
                </div>

                <div className="md:order-none order-4 mt-3 md:mt-0 ml-2 md:ml-0">
                    <UserAddress></UserAddress>
                </div>

                <DesktopHeaderNav></DesktopHeaderNav>

                <ProductSearch></ProductSearch>

                <div className="flex justify-center gap-6 items-center p-2">
                    <CartButton></CartButton>
                    <HeaderUserButton></HeaderUserButton>
                </div>
            </HeaderBase>
        </>
    )
}
