import { CopyIcon } from "lucide-react"
import CopyToClipboard from "react-copy-to-clipboard"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

export default function FieldTooLong(props: { content: string; numberOfCols: number }) {
    const maxShowLength = Math.ceil(500 / props.numberOfCols)

    if (maxShowLength >= props.content.length) {
        return <span className="text-nowrap">{props.content}</span>
    }

    return (
        <Popover>
            <PopoverTrigger>
                <span className="text-nowrap">{props.content.slice(0, maxShowLength) + "..."}</span>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-row gap-1 items-center text-wrap">
                    <CopyToClipboard
                        text={props.content}
                        onCopy={() => {
                            toast(<span className="text-green-500">Copiado!</span>)
                        }}
                    >
                        <button
                            type="button"
                            className="hover:border-black border border-transparent rounded mr-1"
                        >
                            <CopyIcon></CopyIcon>
                        </button>
                    </CopyToClipboard>
                    <p>{props.content.length > 1000 ? props.content.slice(0, 1000) + "..." : props.content}</p>
                </div>
            </PopoverContent>
        </Popover>
    )
}
