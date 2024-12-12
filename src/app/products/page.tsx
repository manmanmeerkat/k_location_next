"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import "../globals.css";
import ProductModal from "../components/ProductModal";
import { Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

type Product = {
  id: number;
  product_number: string;
  location_number: string;
  box_type: string;
};

type ProductDetail = Product & {
  location_capacity: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

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
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("製品情報を取得できませんでした。");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 製品詳細フェッチ
  const fetchProductDetails = async (product_number: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("product_number", product_number)
        .single<ProductDetail>();

      if (error) throw error;

      setSelectedProduct(data as ProductDetail);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("製品詳細を取得できませんでした。");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* ページヘッダー */}
            <div className="bg-indigo-600 text-white px-6 py-5 flex items-center space-x-4">
              <Package className="w-8 h-8" />
              <h1 className="text-2xl font-bold">品番検索</h1>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-4 bg-red-100 text-red-600 rounded-lg">
                {error}
              </div>
            )}

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
                    {["ID", "品番", "ロケーション番号"].map((header) => (
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
                        データを読み込んでいます...
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr 
                        key={product.product_number} 
                        className="hover:bg-gray-50 transition-colors border-b last:border-b-0 cursor-pointer"
                        onClick={() => fetchProductDetails(product.product_number)}
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    </ProtectedRoute>
  );
}
