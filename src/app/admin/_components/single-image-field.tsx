"use client"

import Image from "next/image"
import { Input } from "~/components/ui/input"

export default function SingleImageField(props: { onChange: (value: string) => void; value: string; disabled?: boolean }) {
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
                type="text"
                {...props}
                onChange={(event) => props.onChange(event.target.value)}
            ></Input>
        </div>
    )
}
