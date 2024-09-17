import { CopyIcon } from "lucide-react"
import CopyToClipboard from "react-copy-to-clipboard"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"

export default function FieldTooLong(props: { content: string }) {
    return (
        <Popover>
            <PopoverTrigger>
                <span>
                    {props.content.slice(0, 20)}
                    ...
                </span>
            </PopoverTrigger>
            <PopoverContent>
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
                    <p>
                        {props.content.slice(0, 255)}
                        {props.content.length >= 255 ? "..." : ""}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    )
}
