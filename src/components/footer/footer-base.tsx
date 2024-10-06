import { env } from "~/env"

export default function FooterBase({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-8">
                {children}
                <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center">
                    <p className="text-sm">&copy; 2024 {env.APP_NAME}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
