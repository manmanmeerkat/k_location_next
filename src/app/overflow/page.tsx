"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import "../globals.css";
import { Trash2, Loader2, AlertCircle } from "lucide-react"; // アイコンのインポート

type OverflowData = {
  product_number: string;
  location_number: string;
  count: number;
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
  const handleDelete = async (product_number: string, location_number: string) => {
    const { error } = await supabase.rpc("soft_delete_overflow", {
      product_number_arg: product_number,
      location_number_arg: location_number,
    });

    if (error) {
      console.error("Error deleting overflow item:", error.message);
      setError("削除に失敗しました。");
    } else {
      setOverflowData((prevData) =>
        prevData.filter(
          (item) =>
            item.product_number !== product_number ||
            item.location_number !== location_number
        )
      );
    }
  };

  return (
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
                  <th className="py-3 px-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overflowData.map((item) => (
                  <tr
                    key={`${item.product_number}-${item.location_number}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-4 px-4 text-gray-700">{item.product_number}</td>
                    <td className="py-4 px-4 text-gray-700">{item.location_number}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() =>
                          handleDelete(item.product_number, item.location_number)
                        }
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
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
  );
};

export default OverflowList;
