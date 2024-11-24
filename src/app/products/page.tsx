'use client';

import { supabase } from "../../../utils/supabase";
import { useState, useEffect } from "react";
import "../globals.css";
import Header from "../components/Header";

type Product = {
  id: number;
  product_number: string;
  location_number: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 1ページに表示するアイテム数
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(""); // 入力されたページ番号
  const [searchQuery, setSearchQuery] = useState(""); // 検索クエリ
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 入力の遅延（debounce）を設定
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300msの遅延
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      const query = supabase
        .from("products")
        .select("*", { count: "exact" }) // データの総数を取得
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (debouncedQuery) {
        query.ilike("product_number", `%${debouncedQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching products:", error.message);
        return;
      }

      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    };

    fetchProducts();
  }, [currentPage, debouncedQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page)) {
      handlePageChange(page);
    }
  };

  return (<>
    <Header />
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">品番検索</h1>

      {/* 検索ボックス */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm"
          placeholder="検索する品番を入力"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">品番</th>
              <th className="px-4 py-2 border">ロケーション番号</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{product.id}</td>
                <td className="px-4 py-2 border">{product.product_number}</td>
                <td className="px-4 py-2 border">{product.location_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white font-bold rounded"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <input
          type="text"
          className="px-2 py-1 border border-gray-300 rounded text-center w-16"
          placeholder={`${currentPage}`}
          value={inputPage}
          onChange={handleInputChange}
        />
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
          onClick={handleGoToPage}
        >
          Go
        </button>
        <button
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white font-bold rounded"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <p className="text-center mt-2 text-gray-600">
        Page {currentPage} of {totalPages}
      </p>
    </div>
    </>
  );
}
