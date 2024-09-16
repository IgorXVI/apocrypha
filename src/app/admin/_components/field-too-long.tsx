"use client"

import { CopyIcon } from "lucide-react"
import { useRef } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip"

export default function FieldTooLong(props: { content: string }) {
    const triggerRef = useRef(null)

    return (
        <TooltipProvider>
            <Tooltip>
                <div className="flex flex-row gap-1 items-center">
                    <CopyToClipboard
                        text={props.content}
                        onCopy={() => {
                            toast(
                                <span className="text-green-500">
                                    Copiado!
                                </span>,
                            )
                        }}
                    >
                        <button
                            type="button"
                            className="hover:border-black border border-transparent rounded mr-1"
                        >
                            <CopyIcon></CopyIcon>
                        </button>
                    </CopyToClipboard>
                    <TooltipTrigger
                        ref={triggerRef}
                        onClick={(event) => event.preventDefault()}
                    >
                        <span>
                            {props.content.slice(0, 5)}
                            ...
                        </span>
                    </TooltipTrigger>
                    <TooltipContent
                        sideOffset={5}
                        onPointerDownOutside={(event) => {
                            if (event.target === triggerRef.current)
                                event.preventDefault()
                        }}
                    >
                        {props.content}
                    </TooltipContent>
                </div>
            </Tooltip>
        </TooltipProvider>
    )
}
