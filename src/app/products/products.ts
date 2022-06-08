export interface Product {
    name: string;
    id: number;
    price: number;
    quantity: number;
}

export const products: Product[] = [
    {
        name: 'Rice',
        id: 1,
        price: 30,
        quantity: 25
    },
    {
        name: 'Ear phones',
        id: 2,
        price: 300,
        quantity: 2
    },
    {
        name: 'Sandals',
        id: 3,
        price: 3000,
        quantity: 1
    },
    {
        name: 'Random thing',
        id: 4,
        price: 25,
        quantity: 256
    },
];