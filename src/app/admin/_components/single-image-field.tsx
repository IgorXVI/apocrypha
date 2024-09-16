import { toast } from "sonner"
import { ImageIcon } from "lucide-react"

import { UploadButton } from "~/lib/utils"

export default function SingleImageField(props: {
    onChange: (fileUrl: string) => void
    value?: string
}) {
    return (
        <div className="flex flex-col gap-3 items-center justify-center">
            {!props.value && <ImageIcon height={150} width={150}></ImageIcon>}
            {props.value && (
                <img
                    src={props.value}
                    width={150}
                    height={150}
                    className="aspect-square rounded-md object-cover"
                    alt="Imagem que foi salva no servidor."
                />
            )}
            <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    toast(
                        <span className="text-lg text-green-500">
                            Upload concluído.
                        </span>,
                    )
                    const url = res[0]?.url ?? ""
                    props.onChange(url)
                    //setImgUrl((prev) => (url === "" ? prev : url))
                }}
                onUploadError={(error: Error) => {
                    const message = error.message.includes("FileSizeMismatch")
                        ? "Imagem muito grande."
                        : error.message

                    toast(
                        <span className="text-red-500">
                            Erro ao tentar fazer upload da imagem: {message}
                        </span>,
                        {
                            duration: 5000,
                        },
                    )
                }}
            ></UploadButton>
        </div>
    )
}
