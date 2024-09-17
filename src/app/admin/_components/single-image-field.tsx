import { toast } from "sonner"
import { LoaderCircleIcon, ImageUpIcon } from "lucide-react"
import Image from "next/image"

import { useUploadThing } from "~/lib/utils"

type Input = Parameters<typeof useUploadThing>

const useUploadThingInputProps = (...args: Input) => {
    const $ut = useUploadThing(...args)

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return
        }

        const selectFiles = Array.from(e.target.files)

        if (selectFiles.length === 0) {
            return
        }

        await $ut.startUpload(selectFiles)
    }

    return {
        inputProps: {
            onChange,
            multiple: false,
            accept: "image/*",
        },
        isUploading: $ut.isUploading,
    }
}

export default function SingleImageField(props: {
    onChange: (fileUrl: string) => void
    value?: string
}) {
    const { inputProps } = useUploadThingInputProps("imageUploader", {
        onUploadBegin() {
            toast(
                <div className="flex gap-2 items-center">
                    <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
                    <span className="text-lg">Fazendo upload...</span>
                </div>,
                {
                    duration: 100000,
                    id: "upload-begin",
                },
            )
        },
        onUploadError(e) {
            toast.dismiss("upload-begin")
            toast.error(
                <span className="text-lg text-red-500">
                    Erro durante upload: {e.message}
                </span>,
                {
                    duration: 5000,
                },
            )
        },
        onClientUploadComplete(res) {
            toast.dismiss("upload-begin")
            toast(
                <span className="text-lg text-green-500">Upload completo</span>,
            )
            props.onChange(res[0]?.url ?? "")
        },
    })

    return (
        <div className="flex flex-col gap-3 items-center justify-center">
            {props.value && (
                <Image
                    src={props.value}
                    width={150}
                    height={150}
                    className="aspect-square rounded-md object-cover"
                    alt="Imagem que foi salva no servidor."
                />
            )}
            <label htmlFor="upload-button">
                <ImageUpIcon
                    width={50}
                    height={50}
                    className="cursor-pointer hover:border-black rounded border border-gray-400 p-1"
                ></ImageUpIcon>
            </label>
            <input
                id="upload-button"
                type="file"
                className="sr-only"
                {...inputProps}
            ></input>
        </div>
    )
}
