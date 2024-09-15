"use client"

import CreateOrUpdate from "~/app/admin/_components/create-or-update"
import { updatePageProps } from "../../config"

export default function UpdateOne({
    params: { id },
}: {
    params: { id: string }
}) {
    return <CreateOrUpdate {...updatePageProps(id)}></CreateOrUpdate>
}
