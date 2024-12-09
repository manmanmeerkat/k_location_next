"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import "../globals.css";
import { Loader2, AlertCircle } from "lucide-react"; // アイコンのインポート
import { supabase } from "../../../utils/supabase";

type OverflowData = {
  product_number: string;
  location_number: string;
  count: number;
  created_at: string;
  overflow_quantity: number;
  id: string;
  box_type: string;
};

const OverflowList = () => {
  const [overflowData, setOverflowData] = useState<OverflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const fetchOverflowData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_overflow_counts");

      if (error) {
        setError("データの取得に失敗しました。");
        console.error("Error fetching overflow data:", error.message);
      } else {
        setOverflowData(data || []);
      }

      setLoading(false);
    };

    fetchOverflowData();
  }, []);

  // 削除処理
  const handleDelete = async (product_number: string, location_number: string, created_at: string) => {
    // 確認アラートを表示
    const confirmDelete = window.confirm(
      `品番: ${product_number}, ロケーション番号: ${location_number}, オーバーフロー日時: ${new Date(created_at).toLocaleString()} を削除しますか？`
    );

    if (!confirmDelete) {
      return; // ユーザーがキャンセルを選択した場合、処理を中断
    }

    const { error } = await supabase.rpc("soft_delete_overflow", {
      product_number_arg: product_number,
      location_number_arg: location_number,
      created_at_arg: created_at, // created_atも引数として渡す
    });

    if (error) {
      console.error("Error deleting overflow item:", error.message);
      setError("削除に失敗しました。");
    } else {
      setOverflowData((prevData) =>
        prevData.filter(
          (item) =>
            item.product_number !== product_number ||
            item.location_number !== location_number ||
            item.created_at !== created_at // created_atでさらにフィルタリング
        )
      );
    }
  };
  console.log("item", overflowData);

  return (
    <ProtectedRoute>
      <>
        <Header />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">オーバーフロー回数</h2>

          {/* エラーメッセージ */}
          {error && (
            <div className="flex items-center bg-red-500 text-white p-3 mb-4 rounded">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* ローディング */}
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="ml-4 text-blue-500">データを読み込んでいます...</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-4 text-left">品番</th>
                    <th className="py-3 px-4 text-left">ロケーション番号</th>
                    <th className="py-3 px-4 text-left">箱種</th>
                    <th className="py-3 px-4 text-left">数量</th>
                    <th className="py-3 px-4 text-left">オーバーフロー日</th>
                    <th className="py-3 px-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {overflowData.map((item) => (
                    <tr
                      key={`${item.product_number}-${item.location_number}-${item.created_at}`}
                      className="hover:bg-gray-50"
                    >
                      <td>{item.product_number}</td>
                      <td>{item.location_number}</td>
                      <td>{item.box_type}</td>
                      <td>{item.overflow_quantity}</td>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(item.product_number, item.location_number, item.created_at)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
};

export default OverflowList;
