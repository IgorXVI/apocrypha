import { z } from "zod"
import { calcSkip } from "~/lib/utils"
import { db } from "~/server/db"
import ParamsSearch from "./_components/params-search"
import DataTable from "./_components/data-table"

export default async function FeedbacksPage({
    searchParams,
}: {
    searchParams: {
        page?: string
        searchTerm?: string
    }
}) {
    const currentPage = Number(searchParams.page) || 1

    const currentTake = 20

    const UUIDValidation = z.string().uuid()
    const searchTermIsUUIDResult = UUIDValidation.safeParse(searchParams.searchTerm)
    const idSearch = searchTermIsUUIDResult.success ? searchParams.searchTerm : undefined

    const [feedbacks, total] = await Promise.all([
        db.feedback.findMany({
            take: currentTake,
            skip: calcSkip(currentPage, currentTake),
            where: searchParams.searchTerm
                ? {
                      OR: [
                          {
                              id: idSearch,
                          },
                          {
                              userId: searchParams.searchTerm,
                          },
                          {
                              userName: searchParams.searchTerm,
                          },
                          {
                              userEmail: searchParams.searchTerm,
                          },
                      ],
                  }
                : undefined,
            orderBy: {
                createdAt: "desc",
            },
        }),
        db.feedback.count(),
    ])

    return (
        <div className="container flex flex-col gap-5 py-5">
            <div className="flex flex-row justify-end">
                <ParamsSearch paramName="searchTerm"></ParamsSearch>
            </div>
            <DataTable
                name="feedback"
                namePlural="feedbacks"
                tableDescription="Leia os feedbacks."
                tableHeaders={{
                    id: "ID",
                    type: "Tipo",
                    createdAt: "Data de criação",
                    userId: "ID do usuário",
                    userName: "Nome do usuário",
                    userEmail: "Email do usuário",
                    message: "Mensagem",
                }}
                rows={feedbacks}
                isError={false}
                isSuccess={true}
                isLoading={false}
                pagination={{
                    urlPageParamName: "page",
                    total,
                    page: currentPage,
                    take: currentTake,
                }}
            ></DataTable>
        </div>
    )
}
