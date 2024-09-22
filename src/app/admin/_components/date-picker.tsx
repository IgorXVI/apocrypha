"use client"

import React from "react"
import { DateTimePicker } from "~/components/ui/datetime-picker"
import { ptBR } from "date-fns/locale"

export function DatePicker(props: { onChange: (value: Date | undefined) => void; value: Date | undefined; disabled?: boolean }) {
    return (
        <div className="flex w-72 flex-col gap-3">
            <DateTimePicker
                locale={ptBR}
                disabled={props.disabled}
                value={props.value}
                onChange={(value) => props.onChange(value)}
            />
        </div>
    )
}