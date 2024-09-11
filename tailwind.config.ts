import { type Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
    content: ["./src/**/*.tsx"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist-sans)", ...fontFamily.sans],
            },
            colors: {
                "darkblue-500": "#485769",
                "darkblue-600": "#37475A",
                "darkblue-700": "#232F3E",
                "darkblue-900": "#191E26",
                "darkblue-950": "#131A22",
                "gold-100": "#FEBD69",
                "gold-200": "#FAA63A",
                "orange-650": "#E47911",
                "yellow-350": "#F0C14B",
            },
            spacing: {
                "7": "1.75rem",
                "75px": "75px",
                "210px": "210px",
            },
        },
    },
    plugins: [],
} satisfies Config
