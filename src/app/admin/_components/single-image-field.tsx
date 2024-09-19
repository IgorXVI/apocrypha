import { generateReactHelpers } from "@uploadthing/react"

import { type OurFileRouter } from "~/app/api/uploadthing/core"
import { Input } from "~/components/ui/input"
import Image from "next/image"
import { toast } from "sonner"

export const { useUploadThing } = generateReactHelpers<OurFileRouter>()

export default function SingleImageField(props: {
    onChange: (value: string) => void
    value: string
    disabled?: boolean
}) {
    const uploadThing = useUploadThing("imageUploader", {
        onUploadError(e) {
            toast.error(
                <span className="text-lg text-red-500">
                    Erro durante upload: {e.message}
                </span>,
                {
                    duration: 5000,
                },
            )
        },
    })

    return (
        <div className="flex flex-col gap-3 items-center justify-center">
            {props.value && (
                <Image
                    src={props.value}
                    width={250}
                    height={250}
                    className="aspect-square rounded-md object-cover"
                    alt="Imagem que foi salva no servidor."
                />
            )}
            <Input
                type="file"
                disabled={props.disabled}
                multiple={false}
                accept="image/*"
                onChange={async (e) => {
                    if (!e.target.files) {
                        return
                    }

                    const selectFiles = Array.from(e.target.files)

                    if (selectFiles.length === 0) {
                        return
                    }

                    const result = await uploadThing.startUpload(selectFiles)

                    if (result) {
                        props.onChange(result[0]?.url ?? "")
                    }
                }}
            ></Input>
        </div>
    )
}
