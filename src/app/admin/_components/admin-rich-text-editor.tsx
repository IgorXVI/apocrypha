import {
    DefaultEditorOptions,
    RichTextInput,
    RichTextInputToolbar,
    FormatButtons,
    AlignmentButtons,
    ListButtons,
    LinkButtons,
    QuoteButtons,
    ClearButtons,
    useTiptapEditor,
} from "ra-input-rich-text"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Remove from "@mui/icons-material/Remove"
import { ToggleButton } from "@mui/material"

const AdminRichTextInputToolbar = ({ size, ...props }: { size: "small" | "medium" | "large" }) => {
    const editor = useTiptapEditor()

    return (
        <RichTextInputToolbar {...props}>
            <FormatButtons size={size} />
            <AlignmentButtons size={size} />
            <ListButtons size={size} />
            <LinkButtons size={size} />
            <QuoteButtons size={size} />
            <ClearButtons size={size} />
            <ToggleButton
                aria-label="Add an horizontal rule"
                title="Add an horizontal rule"
                value="left"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                selected={editor?.isActive("horizontalRule")}
            >
                <Remove fontSize="inherit" />
            </ToggleButton>
        </RichTextInputToolbar>
    )
}

const AdminEditorOptions = {
    ...DefaultEditorOptions,
    extensions: [...(DefaultEditorOptions.extensions ?? []), HorizontalRule],
}

export function AdminRichTextInput({ size, ...props }: { size: "small" | "medium" | "large" }) {
    return (
        <div>
            <RichTextInput
                editorOptions={AdminEditorOptions}
                toolbar={<AdminRichTextInputToolbar size={size} />}
                source="text"
                label="Escreva o texto no campo abaixo."
                {...props}
            />
        </div>
    )
}
