"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import "../globals.css";

type QRCodeData = {
  id: number;
  content: string;
  quantity: number;
  scanned_at: string | null;
};

type SortOrder = "asc" | "desc";

const QRCodeList = () => {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [contentSearch, setContentSearch] = useState("");

  const fetchQRCodes = async (order: SortOrder) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .order("scanned_at", { ascending: order === "asc" });

    if (error) {
      setError("QRコードデータの取得に失敗しました。");
      console.error("Error fetching QR codes:", error);
    } else {
      setQRCodes(data);
      setFilteredCodes(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQRCodes(sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    const filtered = qrCodes.filter((code) =>
      code.content.toLowerCase().includes(contentSearch.toLowerCase())
    );
    setFilteredCodes(filtered);
  }, [contentSearch, qrCodes]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">QRコード一覧</h1>

          {/* 検索フィルター */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="品番で検索..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-500">読み込み中...</span>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      QRコード内容
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      数量
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={toggleSortOrder}
                        className="flex items-center space-x-2 hover:text-gray-700 group"
                      >
                        <span>スキャン日時</span>
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-4 h-4 ${
                              sortOrder === "asc"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          <ChevronDown
                            className={`w-4 h-4 ${
                              sortOrder === "desc"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        データが見つかりません
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((qrCode) => (
                      <tr key={qrCode.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {qrCode.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {qrCode.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {qrCode.scanned_at
                            ? new Date(qrCode.scanned_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default QRCodeList;
