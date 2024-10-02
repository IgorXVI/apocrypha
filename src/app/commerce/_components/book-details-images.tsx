"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "~/components/ui/button"

export default function BookDetailsImages({ images, title }: { images: string[]; title: string }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scrollToImage = (index: number) => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current
            const targetImage = scrollContainer.children[index] as HTMLElement
            if (targetImage) {
                const scrollLeft = targetImage.offsetLeft - scrollContainer.offsetWidth / 2 + targetImage.offsetWidth / 2
                scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" })
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Enter" || e.key === " ") {
            setSelectedImageIndex(index)
            scrollToImage(index)
        }
    }

    useEffect(() => {
        scrollToImage(selectedImageIndex)
    }, [selectedImageIndex])

    return (
        <div className="mt-6">
            <div className="mb-4 relative">
                <Image
                    src={images[selectedImageIndex] ?? ""}
                    alt={`${title} - Selected Image`}
                    width={400}
                    height={200}
                    className="rounded-md object-cover mx-auto"
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    aria-label="Next image"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`shrink-0 cursor-pointer transition-all duration-200 ${
                                index === selectedImageIndex ? "ring-2 ring-primary ring-offset-2" : ""
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Select image ${index + 1}`}
                        >
                            <Image
                                src={image}
                                alt={`${title} - Image ${index + 1}`}
                                width={100}
                                height={150}
                                className="rounded-md object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
