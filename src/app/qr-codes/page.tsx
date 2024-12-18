"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import { Loader2, AlertCircle } from "lucide-react";
import "../globals.css";


type QRCodeData = {
  id: number;
  content: string;
  scanned_at: string | null;
};

const QRCodeList = () => {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .order('id', { ascending: false });

      if (error) {
        setError("QRコードデータの取得に失敗しました。");
        console.error("Error fetching QR codes:", error);
      } else {
        setQRCodes(data);
      }

      setLoading(false);
    };

    fetchQRCodes();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">QRコード一覧</h1>

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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QRコード内容
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スキャン日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qrCodes.map((qrCode) => (
                    <tr key={qrCode.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qrCode.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {qrCode.content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {qrCode.scanned_at 
                          ? new Date(qrCode.scanned_at).toLocaleString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
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