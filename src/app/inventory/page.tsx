"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";
import { supabase } from "../../../utils/supabase"; // Supabaseクライアントをインポート
import Header from "../components/Header";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"; // Lucideアイコンをインポート

type StockRequest = {
  id: number;
  product_number: string;
  requested_at: string;
  status: string;
  requested_by: string;
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <CheckCircle className="text-green-500 w-6 h-6" />;
    case "pending":
      return <Clock className="text-yellow-500 w-6 h-6" />;
    case "cancelled":
      return <XCircle className="text-red-500 w-6 h-6" />;
    default:
      return <Loader2 className="text-gray-400 w-6 h-6 animate-spin" />;
  }
};

export default function InventoryPage() {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockRequests = async () => {
      const { data, error } = await supabase
        .from("stock_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching stock requests:", error.message);
      } else {
        setStockRequests(data);
      }
      setLoading(false);
    };

    fetchStockRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-4 text-blue-500">データを読み込んでいます...</p>
      </div>
    );
  }

  return (
      <div>
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">在庫確認依頼一覧</h1>

          {stockRequests.length === 0 ? (
            <div className="text-center text-gray-500">在庫確認依頼がありません。</div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">品番</th>
                    <th className="py-3 px-4 text-left">依頼日時</th>
                    <th className="py-3 px-4 text-left">ステータス</th>
                    <th className="py-3 px-4 text-left">依頼者</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-100">
                      <td className="py-4 px-4 text-gray-700">{request.id}</td>
                      <td className="py-4 px-4 text-gray-700">{request.product_number}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {new Date(request.requested_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-700 flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{request.requested_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
