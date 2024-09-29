import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export default function SelectEnum(props: {
    disabled?: boolean
    onChange: (value: string) => void
    value?: string
    enumLikeObject: Record<string, string>
}) {
    return (
        <Select
            disabled={props.disabled}
            value={props.value}
            onValueChange={(value) => props.onChange(value)}
            defaultValue={props.value}
        >
            <SelectTrigger>
                <SelectValue placeholder="N/A" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(props.enumLikeObject).map(([key, value], index) => (
                    <SelectItem
                        key={index}
                        value={key}
                    >
                        {value}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
