'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  productNumber: string;
  locationNumber: string;
  createdAt: string;
  updatedAt: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Product List</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="p-4 border rounded">
            <h2 className="font-bold">{product.productNumber}</h2>
            <p>Location Number: {product.locationNumber}</p>
            <p>Created at: {product.createdAt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
