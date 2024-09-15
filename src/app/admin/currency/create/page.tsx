"use client"

import CreateOrUpdate from "~/app/admin/_components/create-or-update"
import { createPageProps } from "../config"

export default function CreateOne() {
    return <CreateOrUpdate {...createPageProps}></CreateOrUpdate>
}
