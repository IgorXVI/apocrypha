"use client"

import { useState } from "react"
import Image from "next/image"

export default function BookDetailsImages({ images, title }: { images: string[]; title: string }) {
    const [zoomedImage, setZoomedImage] = useState("")

    const openZoomedImage = (index: number) => {
        setZoomedImage(images[index] ?? "")
    }

    const closeZoomedImage = () => {
        setZoomedImage("")
    }

    return (
        <>
            <div className="grid grid-cols-4 gap-2 p-4 md:p-12 max-w-2xl">
                <Image
                    src={images[0] ?? ""}
                    alt={`${title} -Imagem principal`}
                    width={400}
                    height={400}
                    className="w-full rounded-md object-cover cursor-zoom-in col-span-3"
                    onClick={() => openZoomedImage(0)}
                />
                <div className="grid gap-2 place-content-center col-span-1 place-self-start">
                    {images.map(
                        (image, index) =>
                            index > 0 && (
                                <Image
                                    key={index}
                                    src={image}
                                    alt={`${title} - Imagem ${index + 1}`}
                                    width={200}
                                    height={200}
                                    onClick={() => openZoomedImage(index)}
                                    className="row-span-1 aspect-square w-full rounded-md object-cover cursor-zoom-in border border-neutral-300"
                                />
                            ),
                    )}
                </div>
            </div>
            {zoomedImage !== "" && (
                <div
                    className="zoomed-image-container"
                    onClick={closeZoomedImage}
                >
                    <Image
                        src={zoomedImage}
                        alt={`${title} - Imagem com zoom`}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            )}
        </>
    )
}
