"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";
import { supabase } from "../../../utils/supabase"; // Supabaseクライアントをインポート
import Header from "../components/Header";

type StockRequest = {
  id: number;
  product_number: string;
  requested_at: string;
  status: string;
  requested_by: string;
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
    return <p>データを読み込んでいます...</p>;
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">在庫確認依頼一覧</h1>

        {loading ? (
          <p>データを読み込んでいます...</p>
        ) : stockRequests.length === 0 ? (
          <p>在庫確認依頼がありません。</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">品番</th>
                <th className="py-2 px-4 border">依頼日時</th>
                <th className="py-2 px-4 border">ステータス</th>
                <th className="py-2 px-4 border">依頼者</th>
              </tr>
            </thead>
            <tbody>
              {stockRequests.map((request) => (
                <tr key={request.id}>
                  <td className="py-2 px-4 border">{request.id}</td>
                  <td className="py-2 px-4 border">{request.product_number}</td>
                  <td className="py-2 px-4 border">
                    {new Date(request.requested_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">{request.status}</td>
                  <td className="py-2 px-4 border">{request.requested_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
