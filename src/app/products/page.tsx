"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import ProductModal from "../components/ProductModal";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Table as TableIcon, 
  Package 
} from 'lucide-react';

type Product = {
  id: number;
  product_number: string;
  location_number: string;
  box_type: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // デバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 製品フェッチ
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = supabase
        .from("product")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      if (debouncedQuery) {
        query.ilike("product_number", `%${debouncedQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 製品詳細フェッチ
  const fetchProductDetails = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSelectedProduct(data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* ページヘッダー */}
          <div className="bg-indigo-600 text-white px-6 py-5 flex items-center space-x-4">
            <Package className="w-8 h-8" />
            <h1 className="text-2xl font-bold">品番検索</h1>
          </div>

          {/* 検索バー */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="検索する品番を入力"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 製品テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {['ID', '品番', 'ロケーション番号'].map((header) => (
                    <th 
                      key={header} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <div className="flex justify-center items-center space-x-2">
                        <TableIcon className="animate-pulse text-gray-400" />
                        <span>データを読み込んでいます...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 transition-colors border-b last:border-b-0 cursor-pointer"
                      onClick={() => fetchProductDetails(product.id)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{product.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.product_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.location_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="p-6 bg-gray-50 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* モーダル表示 */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </div>
  );
}