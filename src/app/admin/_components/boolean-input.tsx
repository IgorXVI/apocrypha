import { Checkbox } from "~/components/ui/checkbox"

export default function BooleanInput(props: { value?: boolean; onChange: (value: boolean) => void }) {
    return (
        <Checkbox
            checked={props.value}
            onCheckedChange={(checked) => props.onChange(Boolean(checked.valueOf()))}
        />
    )
}
