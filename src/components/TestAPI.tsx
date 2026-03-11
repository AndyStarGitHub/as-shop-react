import { useEffect, useState } from "react";
import type { Post } from "../types";


interface TestAPIProps {
    onBuy: (product: any) => void
}

export const TestAPI = ({onBuy}: TestAPIProps) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    useEffect(() => {
        setIsLoading(true);
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then(data => {
                setPosts(data.slice(0, 5));
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Ой, помилка', error);
                setIsLoading(false);
            });            
    }, []);

    if (isLoading) {
        return <div>Завантаження постів...</div>
    }

    return (
        <div style={{ padding: 10, background: '#f4f4f4', borderRadius: 8}}>
            <h3> Пости з сервера </h3>
            <ul>
                {posts.map(post => {
                    const currentPrice = (post.id * 7) % 91 + 10
                    return (
                        <li key={post.id}>
                            <span>{post.title} - {currentPrice}  грн</span>
                            <button
                                onClick={() => onBuy({
                                    id: post.id + 5000,
                                    title: `Пост: ${post.title}`, 
                                    price: currentPrice
                                })}
                            >
                                Купити статтю
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
