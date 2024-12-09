"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import "../globals.css";
import { 
  ArrowUpDown, 
  Filter, 
  Calendar, 
  Table, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

interface OverflowItem {
  product_number: string;
  location_number: string;
  total_quantity: number;
  overflow_count: number;
}

interface OverflowDetail {
  overflow_date: string;
  deleted_after_days: number | null;
  quantity: number;
}

const OverflowStats = () => {
  const [overflowData, setOverflowData] = useState<OverflowItem[]>([]);
  const [detailData, setDetailData] = useState<OverflowDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(0); // 現在のページ
const itemsPerPage = 5; // 1ページあたりのデータ数
const totalPages = Math.ceil(detailData.length / itemsPerPage); // 総ページ数

// 現在のページに表示するデータ
const currentPageData = detailData.slice(
  currentPage * itemsPerPage,
  (currentPage + 1) * itemsPerPage
);

  const fetchOverflowStats = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_overflow_stats', {
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      setError(error.message);
      console.error("Error fetching overflow stats:", error);
    } else {
      setOverflowData(data);
    }
  }, [startDate, endDate]);

  const fetchOverflowDetails = async (productNumber: string) => {
    const { data, error } = await supabase.rpc("get_overflow_details", {
      product_number_arg: productNumber,
    });
  
    if (error) {
      console.error("Error fetching overflow details:", error);
      setError(error.message || "詳細データの取得に失敗しました。");
    } else {
      setDetailData(data || []);
    }
  };
  
  const sortedData = [...overflowData].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.overflow_count - b.overflow_count 
      : b.overflow_count - a.overflow_count;
  });

  const handleProductClick = (productNumber: string) => {
    setSelectedProduct(productNumber);
    fetchOverflowDetails(productNumber);
    setShowModal(true);
  };

  useEffect(() => {
    fetchOverflowStats();
  }, [fetchOverflowStats]);

  return (
    <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* ヘッダーセクション */}
            <div className="bg-indigo-600 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <Table className="w-8 h-8" />
                <h2 className="text-2xl font-bold">オーバーフロー管理ダッシュボード</h2>
                </div>
                <div className="flex items-center space-x-3">
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="bg-indigo-500 hover:bg-indigo-700 rounded-full p-2 transition-colors"
                >
                    <ArrowUpDown className="w-5 h-5" />
                </button>
                </div>
            </div>

            {/* 日付選択セクション */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="mr-2 w-4 h-4 text-gray-500" />
                    開始日
                    </label>
                    <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div className="relative">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="mr-2 w-4 h-4 text-gray-500" />
                    終了日
                    </label>
                    <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-end">
                    <button
                    onClick={fetchOverflowStats}
                    className="w-full flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                    <Filter className="mr-2 w-5 h-5" />
                    データを取得
                    </button>
                </div>
                </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                    <p className="text-red-800">{error}</p>
                </div>
                </div>
            )}

            {/* データテーブル */}
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-100 border-b">
                    <tr>
                    {['品番', 'ロケーション番号', 'オーバーフロー数量', 'オーバーフロー回数'].map((header) => (
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
                    {sortedData.map((item, index) => (
                    <tr 
                        key={index} 
                        className="hover:bg-gray-50 transition-colors border-b last:border-b-0"
                        onClick={() => handleProductClick(item.product_number)}
                    >
                        <td className="px-6 py-4 text-sm text-gray-600">{item.product_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.location_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.total_quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                        <TrendingUp className="mr-2 w-4 h-4 text-indigo-500" />
                        {item.overflow_count}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>

        {showModal && selectedProduct && (
          <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-60 transition-opacity duration-300">
            <div className="relative w-full max-w-4xl p-8 bg-white rounded-2xl shadow-2xl transform scale-95 transition-transform duration-300 hover:scale-100">
              {/* モーダルのヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  品番 {selectedProduct} の詳細
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDetailData([]);
                  }}
                  className="text-gray-500 hover:text-gray-800 focus:outline-none"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </div>

              {/* ページネーション状態 */}
              {detailData.length > 0 ? (
                <>
                  <div className="space-y-4 overflow-y-auto max-h-96">
                    {currentPageData.map((detail, i) => (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row justify-between items-start p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <div className="mb-4 md:mb-0">
                          <p className="text-sm text-gray-500">オーバーフロー発生日:</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {detail.overflow_date}
                          </p>
                        </div>
                        <div className="mb-4 md:mb-0">
                          <p className="text-sm text-gray-500">解消までの日数:</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {detail.deleted_after_days !== null
                              ? `${detail.deleted_after_days} 日`
                              : "未削除"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">数量:</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {detail.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ページネーションボタン */}
                  <div className="mt-4 flex justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md transition-all ${
                        currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                      }`}
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1}
                      className={`px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md transition-all ${
                        currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                      }`}
                    >
                      次へ
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-600">データがありません。</p>
              )}

              {/* モーダルのフッター */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDetailData([]);
                  }}
                  className="px-8 py-3 text-white bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
    </ProtectedRoute>
  );
};

export default OverflowStats;
