"use client"

import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "sonner"

export default function ContactUsPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [inquiryType, setInquiryType] = useState("general")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real application, you would send this data to your server
        console.log({ name, email, message, inquiryType })
        toast("We've received your message and will get back to you soon!")
        // Reset form
        setName("")
        setEmail("")
        setMessage("")
        setInquiryType("general")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Contact Apocrypha</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Get in Touch</CardTitle>
                            <CardDescription>
                                Wed love to hear from you. Fill out the form and well get back to you as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Inquiry Type</Label>
                                    <RadioGroup
                                        value={inquiryType}
                                        onValueChange={setInquiryType}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="general"
                                                id="general"
                                            />
                                            <Label htmlFor="general">General Inquiry</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="order"
                                                id="order"
                                            />
                                            <Label htmlFor="order">Order Status</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="event"
                                                id="event"
                                            />
                                            <Label htmlFor="event">Event Information</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Your message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                >
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Visit Us
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">123 Bookworm Lane</p>
                            <p className="text-lg">Literaryville, LT 12345</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Store Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">Monday - Friday: 9 AM - 9 PM</p>
                            <p className="text-lg">Saturday - Sunday: 10 AM - 8 PM</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Phone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">(555) 123-4567</p>
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
                            <p className="text-lg">info@apocrypha.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
