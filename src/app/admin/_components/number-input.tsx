import { Input } from "~/components/ui/input"

export default function NumberInput(props: { onChange: (value: number) => void; value: number; disabled?: boolean }) {
    return (
        <Input
            type="number"
            className="max-w-36"
            defaultValue={Number.isNaN(props.value) ? "" : props.value}
            disabled={props.disabled}
            onChange={(e) => props.onChange(Number(e.target.value))}
        />
    )
}
