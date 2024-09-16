import { useRef } from "react"
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
            </Tooltip>
        </TooltipProvider>
    )
}
