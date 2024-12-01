"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Bar } from "react-chartjs-2";
import Header from "../components/Header";
import "../globals.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type OverflowData = {
  product_number: string;
  count: number;
};

const OverflowList = () => {
  const [overflowData, setOverflowData] = useState<OverflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false); // グラフの表示を制御

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

  const chartData = {
    labels: overflowData.map((item) => item.product_number),
    datasets: [
      {
        label: "オーバーフロー回数",
        data: overflowData.map((item) => item.count),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">オーバーフロー回数</h2>
        <button
          onClick={() => setShowChart((prev) => !prev)} // トグル処理
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          {showChart ? "グラフを非表示" : "グラフを表示"}
        </button>

        {loading && <div>読み込み中...</div>}

        {error && <div className="bg-red-500 text-white p-2 mb-4">{error}</div>}

        {showChart && !loading && !error && (
          <div className="mb-6">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    ticks: {
                      stepSize: 1,
                      callback: (value) => Number(value).toFixed(0),
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default OverflowList;
