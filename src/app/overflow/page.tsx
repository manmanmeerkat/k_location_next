"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// 使用するスケールや要素を登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Bar } from "react-chartjs-2"; // グラフライブラリ（react-chartjs-2）を使用

type OverflowData = {
  id: number;
  product_number: string;
  overflow_quantity: number;
  box_type: string;
  registered_at: string;
};

const OverflowList = () => {
  const [overflowData, setOverflowData] = useState<OverflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverflowData = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("overflow_management")
        .select("*")
        .order("registered_at", { ascending: false });

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

  const chartData = {
    labels: overflowData.map((item) => item.product_number),
    datasets: [
      {
        label: "オーバーフロー数量",
        data: overflowData.map((item) => item.overflow_quantity),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">オーバーフロー一覧</h2>

      {error && <div className="bg-red-500 text-white p-2 mb-4">{error}</div>}

      <div className="mb-6">
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">品番</th>
              <th className="px-4 py-2 border-b">オーバーフロー数量</th>
              <th className="px-4 py-2 border-b">箱の種類</th>
              <th className="px-4 py-2 border-b">登録日時</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">読み込み中...</td>
              </tr>
            ) : (
              overflowData.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border-b">{item.product_number}</td>
                  <td className="px-4 py-2 border-b">{item.overflow_quantity}</td>
                  <td className="px-4 py-2 border-b">{item.box_type}</td>
                  <td className="px-4 py-2 border-b">{formatDate(item.registered_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverflowList;
