import { generateReactHelpers } from "@uploadthing/react"

import { type OurFileRouter } from "~/app/api/uploadthing/core"
import { Input } from "~/components/ui/input"
import Image from "next/image"
import { toast } from "sonner"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel"

export const { useUploadThing } = generateReactHelpers<OurFileRouter>()

export default function MultipleImageField(props: { onChange: (value: string[]) => void; value: string[]; disabled?: boolean }) {
    const uploadThing = useUploadThing("imageUploader", {
        onUploadError(e) {
            toast.error(<span className="text-lg text-red-500">Erro durante upload: {e.message}</span>, {
                duration: 5000,
            })
        },
    })

    return (
        <div className="flex flex-col gap-3 items-center justify-center">
            {props.value && (
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>
                            {props.value.map((url, index) => (
                                <Image
                                    key={index}
                                    src={url}
                                    width={250}
                                    height={250}
                                    className="aspect-square rounded-md object-cover"
                                    alt="Imagem que foi salva no servidor."
                                />
                            ))}
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}
            <Input
                type="file"
                disabled={props.disabled}
                multiple={true}
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
                        props.onChange(result.map((image) => image.url ?? ""))
                    }
                }}
            ></Input>
        </div>
    )
}
