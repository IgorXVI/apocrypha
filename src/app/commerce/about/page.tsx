import { Book, Clock, Coffee, MapPin } from "lucide-react"
import Image from "next/image"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-4xl font-bold mb-4">About Apocrypha</h1>
                <p className="text-xl text-center max-w-2xl mb-8">
                    Discover the hidden gems of literature at Apocrypha, where every book tells a story beyond its pages.
                </p>
                <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Apocrypha Bookstore Interior"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            Curated Collection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Our shelves are filled with carefully selected titles, from rare first editions to contemporary masterpieces, ensuring a
                            unique reading experience for every visitor.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coffee className="h-5 w-5" />
                            Cozy Reading Nooks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Enjoy your newly discovered book in one of our comfortable reading areas, complete with plush armchairs and soft lighting,
                            perfect for losing yourself in a good story.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Literary Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Join us for regular author readings, book clubs, and writing workshops. Our events calendar is always full of exciting
                            literary happenings.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted rounded-lg p-8 mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg mb-4">
                    At Apocrypha, we believe in the power of books to transform lives, spark imagination, and foster community. Our mission is to
                    create a haven for book lovers, where the joy of reading is celebrated and the art of storytelling is revered.
                </p>
                <p className="text-lg">
                    We strive to support both established and emerging authors, promote literacy in our community, and provide a warm, welcoming space
                    for readers of all ages and backgrounds to explore, discover, and connect through the written word.
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Visit Us</h2>
                    <p className="text-lg mb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        123 Bookworm Lane, Literaryville, LT 12345
                    </p>
                    <p className="text-lg mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Open daily from 9 AM to 9 PM
                    </p>
                    <Button size="lg">Get Directions</Button>
                </div>
                <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Apocrypha Bookstore Exterior"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-lg"
                />
            </div>
        </div>
    )
}
