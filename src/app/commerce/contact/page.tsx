"use client"

import { Clock, Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { createFeedback } from "~/server/actions/feedback"

export default function ContactUsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Contate Apocrypha</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Entre em contato</CardTitle>
                            <CardDescription>
                                Gostaríamos muito de ouvir de você. Preencha o formulário e entraremos em contato com você o mais breve possível.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                action={(formData) => {
                                    toastLoading("Enviando...", "create-feedback")
                                    createFeedback(formData)
                                        .then((result) => {
                                            toast.dismiss("create-feedback")
                                            if (!result.success) {
                                                toastError(result.errorMessage)
                                            } else {
                                                toastSuccess("Enviado")
                                            }
                                        })
                                        .catch((error) => {
                                            toast.dismiss("create-feedback")
                                            toastError(error)
                                        })
                                }}
                                className="flex flex-col gap-4"
                            >
                                <div className="space-y-2">
                                    <Label>Tipo de assunto</Label>
                                    <RadioGroup name="type">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="BUG"
                                                id="bug"
                                            />
                                            <Label htmlFor="bug">Informar um bug</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="ORDER"
                                                id="order"
                                            />
                                            <Label htmlFor="order">Perguntar sobre um pedido</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="MISC"
                                                id="other"
                                            />
                                            <Label htmlFor="other">Outro assunto</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem</Label>
                                    <Textarea
                                        name="message"
                                        id="message"
                                        placeholder="Sua mensagem"
                                        rows={2}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="max-w-sm place-self-center"
                                >
                                    Enviar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Horário de atendimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">Segunda a sexta: 8h - 18h</p>
                            <p className="text-lg">Sábado e Domingo: 8h - 12h</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                WhatsApp
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">+55 (54) 99985-6046</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">jacirdealmeida83@gmail.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
