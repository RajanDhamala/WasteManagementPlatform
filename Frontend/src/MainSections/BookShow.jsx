import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart } from "lucide-react";


const BookShow = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}event/show/35`);
                const data = await response.json();
                setBooks([...data.data]);
            } catch (err) {
                setError("Failed to load books");
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-3 h-3 ${
                    index < rating 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`}
            />
        ));
    };

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
                <Card key={index} className="shadow-sm">
                    <Skeleton className="w-full h-48" />
                    <CardContent className="mt-2">
                        <Skeleton className="h-3 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/4 mb-2" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (loading) return (
        <div className="container mx-auto p-4">
            <Skeleton className="h-8 w-48 mx-auto mb-6" />
            <LoadingSkeleton />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
                Try Again
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6">Book Collection</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {books.map((book, index) => (
                    <Card 
                        key={book._id} 
                        className="group bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                        style={{
                            animation: `fadeIn 0.5s ease-out ${index * 0.1}s`,
                            opacity: 0,
                            animationFillMode: 'forwards'
                        }}
                    >
                        <style jsx global>{`
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                        <div className="w-full h-48 overflow-hidden bg-gray-50">
                            <img
                                src={book.Img}
                                alt={book.title}
                                className="w-full h-full object-contain p-2 transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = "/api/placeholder/200/300";
                                    e.target.alt = "Book cover not available";
                                }}
                            />
                        </div>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-0.5 mb-1">
                                {renderStars(book.rating || 0)}
                            </div>
                            <a 
                                href={book.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block"
                            >
                                <h2 className="text-sm font-medium mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors duration-300 cursor-pointer hover:underline">
                                    {book.title}
                                </h2>
                            </a>
                            <p className="text-lg font-bold text-green-600 mb-2 transition-transform duration-300 group-hover:scale-105">
                                £{Number(book.price).toFixed(2)}
                            </p>
                            <div className="flex items-center mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                                    book.inStock === false 
                                    ? 'bg-red-100 text-red-800 group-hover:bg-red-200' 
                                    : 'bg-green-100 text-green-800 group-hover:bg-green-200'
                                }`}>
                                    {book.inStock === false ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                            <Button 
                                className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700 transition-all duration-300 group-hover:translate-y-[-2px]"
                            >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add to basket
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BookShow;