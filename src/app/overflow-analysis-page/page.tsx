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

interface OverflowItem {
  product_number: string;
  location_number: string;
  total_quantity: number;
  overflow_count: number;
}

const OverflowStats = () => {
  const [overflowData, setOverflowData] = useState<OverflowItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const sortedData = [...overflowData].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.overflow_count - b.overflow_count 
      : b.overflow_count - a.overflow_count;
  });

  useEffect(() => {
    fetchOverflowStats();
  }, [fetchOverflowStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* ヘッダーセクション */}
          <div className="bg-indigo-600 text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Table className="w-8 h-8" />
              <h2 className="text-2xl font-bold">オーバーフロー統計ダッシュボード</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
    </div>
  );
};

export default OverflowStats;