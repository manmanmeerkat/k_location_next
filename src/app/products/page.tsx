"use client";

import { supabase } from "../../../utils/supabase";
import { useState, useEffect } from "react";
import "../globals.css";
import Header from "../components/Header";
import ProductModal from "../components/ProductModal"; // モーダルをインポート

type Product = {
  id: number;
  product_number: string;
  location_number: string;
  description: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // 選択された製品

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      const query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      if (debouncedQuery) {
        query.ilike("product_number", `%${debouncedQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching products:", error.message);
        return;
      }

      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    };

    fetchProducts();
  }, [currentPage, debouncedQuery]);

  const fetchProductDetails = async (id: number) => {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

    if (error) {
      console.error("Error fetching product details:", error.message);
      return;
    }

    setSelectedProduct(data);
  };

  return (
    <>
      <Header />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">品番検索</h1>

        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm"
          placeholder="検索する品番を入力"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th>ID</th>
                <th>品番</th>
                <th>ロケーション番号</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => fetchProductDetails(product.id)} // クリックで詳細を取得
                >
                  <td className="px-4 py-2 border">{product.id}</td>
                  <td className="px-4 py-2 border">{product.product_number}</td>
                  <td className="px-4 py-2 border">{product.location_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* モージネーションボタンを追加 */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            前へ
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            次へ
          </button>
        </div>

        {/* モーダル表示 */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </>
  );
}
