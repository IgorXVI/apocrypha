import { Switch } from "~/components/ui/switch"

export default function BooleanInput(props: { disabled?: boolean; value?: boolean; onChange: (value: boolean) => void }) {
    return (
        <Switch
            disabled={props.disabled}
            checked={props.value}
            onCheckedChange={(checked) => props.onChange(Boolean(checked.valueOf()))}
        />
    )
}
