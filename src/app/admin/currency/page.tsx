"use client"

import SearchPage from "~/app/admin/_components/search-page"

import { searchPageProps } from "./config"

export default function MainPage() {
    return <SearchPage {...searchPageProps}></SearchPage>
}
