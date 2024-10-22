"use client"

import Image from "next/image"
import { Textarea } from "~/components/ui/textarea"

export default function MultipleImageField(props: { onChange: (value: string[]) => void; value?: string[]; disabled?: boolean }) {
    return (
        <div className="flex flex-col gap-2 items-center justify-center">
            {props.value && props.value.length > 0 && !props.value.every((v) => v.length === 0) && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {props.value.map((url, index) => (
                        <Image
                            key={index}
                            src={url}
                            width={250}
                            height={250}
                            className="aspect-square rounded-md object-cover border"
                            alt="Imagem que foi salva no servidor."
                        />
                    ))}
                </div>
            )}
            <Textarea
                rows={4}
                placeholder="Link1"
                disabled={props.disabled}
                defaultValue={props.value?.join("\n")}
                onChange={async (e) => props.onChange(e.target.value.split("\n").filter((v) => v.length > 0))}
            ></Textarea>
        </div>
    )
}
