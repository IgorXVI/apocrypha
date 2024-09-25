import HeaderBase from "~/components/header/header-base"
import MobileAddressHeader from "./mobile-address-header"
import HeaderUserButton from "~/components/header/header-user-button"
import MenuSheet from "~/components/header/menu-sheet"
import ProductSearch from "./product-search"
import CompanyIconButton from "~/components/header/company-icon-button"
import DesktopAddressHeader from "./desktop-address-header"
import CartButton from "./cart-button"

export default function CommerceHeader() {
    return (
        <>
            <HeaderBase>
                <div className="flex gap-1 md:gap-3 justify-center items-center mr-auto md:mr-0">
                    <MenuSheet></MenuSheet>
                    <CompanyIconButton></CompanyIconButton>
                    <DesktopAddressHeader></DesktopAddressHeader>
                </div>

                <ProductSearch></ProductSearch>

                <div className="flex justify-center gap-6 items-center p-2">
                    <CartButton></CartButton>
                    <HeaderUserButton></HeaderUserButton>
                </div>
            </HeaderBase>
            <MobileAddressHeader></MobileAddressHeader>
        </>
    )
}
