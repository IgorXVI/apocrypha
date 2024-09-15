"use client"

import DeletePage from "~/app/admin/_components/delete-page"
import { deletePageProps } from "../../config"

export default function DeleteOne({
    params: { id },
}: {
    params: { id: string }
}) {
    return <DeletePage {...deletePageProps(id)}></DeletePage>
}
