"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";
import { supabase } from "../../../utils/supabase";
import Header from "../components/Header";
import { CheckCircle, XCircle, Clock, Loader2, X } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

type StockRequest = {
  id: number;
  product_number: string;
  requested_at: string;
  checked_at: string | null;
  status: string;
  requested_by: string;
  stock_quantity: number | null;
  location_capacity: number | null;
  product: {
    location_capacity: number | null;
  } | null;
  is_deleted: boolean;
  deleted_at: string | null;
};

type ResponseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stockRequest: StockRequest | null;
  onSubmit: (stockQuantity: number) => Promise<void>;
};

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  stockRequest: StockRequest | null;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).replace(")", `)`)
};

const getStockRatioColor = (ratio: number) => {
  if (ratio >= 0.8) return "text-red-600";
  if (ratio >= 0.5) return "text-yellow-600";
  return "text-green-600";
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stockRequest
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !stockRequest) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting request:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">削除の確認</h2>
        <p className="mb-4">
          以下の在庫確認依頼を削除してよろしいですか？
          <br />
          <span className="font-medium mt-2 block">品番: {stockRequest.product_number}</span>
          <span className="text-sm text-gray-600 block mt-1">
            確認日時: {formatDate(stockRequest.checked_at!)}
          </span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            disabled={isDeleting}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                削除中...
              </div>
            ) : (
              "削除する"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResponseModal: React.FC<ResponseModalProps> = ({
  isOpen,
  onClose,
  stockRequest,
  onSubmit
}) => {
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !stockRequest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(Number(stockQuantity));
      setStockQuantity("");
      onClose();
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">在庫確認回答</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">品番: {stockRequest.product_number}</p>
          <p className="text-gray-600">
            依頼日時: {formatDate(stockRequest.requested_at)}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              在庫数量
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                min="0"
              />
              <span className="ml-2">個</span>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  送信中...
                </div>
              ) : (
                "回答する"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<StockRequest | null>(null);

  useEffect(() => {
    const fetchStockRequests = async () => {
      const { data, error } = await supabase
        .from("stock_requests")
        .select(`
          *,
          product:product_number (
            location_capacity
          )
        `)
        .is('is_deleted', false)
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching stock requests:", error.message);
      } else {
        const formattedData = data.map(request => ({
          ...request,
          location_capacity: request.product?.location_capacity ?? null
        })) as StockRequest[];
        setStockRequests(formattedData);
      }
      setLoading(false);
    };

    fetchStockRequests();
  }, []);

  const handleRowClick = (request: StockRequest) => {
    if (request.status === "completed") {
      setRequestToDelete(request);
      setIsDeleteModalOpen(true);
    } else {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!requestToDelete) return;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("stock_requests")
      .update({
        is_deleted: true,
        deleted_at: now
      })
      .eq("id", requestToDelete.id);

    if (updateError) {
      throw updateError;
    }

    setStockRequests(prev => prev.filter(req => req.id !== requestToDelete.id));
  };

  const handleResponseSubmit = async (stockQuantity: number) => {
    if (!selectedRequest) return;

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("stock_requests")
      .update({
        stock_quantity: stockQuantity,
        checked_at: now,
        status: "completed"
      })
      .eq("id", selectedRequest.id);

    if (updateError) {
      throw updateError;
    }

    setStockRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? {
              ...req,
              stock_quantity: stockQuantity,
              checked_at: now,
              status: "completed"
            }
          : req
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-4 text-blue-500">データを読み込んでいます...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            在庫確認依頼一覧
          </h1>

          {stockRequests.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
              在庫確認依頼がありません。
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">品番</th>
                    <th className="py-3 px-4 text-left">依頼日時</th>
                    <th className="py-3 px-4 text-left">確認日時</th>
                    <th className="py-3 px-4 text-left">ステータス</th>
                    <th className="py-3 px-4 text-left">依頼者</th>
                    <th className="py-3 px-4 text-left">在庫量</th>
                    <th className="py-3 px-4 text-left">収容能力</th>
                    <th className="py-3 px-4 text-left">在庫比率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockRequests.map((request) => {
                    const stockRatio = (request.location_capacity != null && 
                                     request.location_capacity > 0 && 
                                     request.stock_quantity != null)
                      ? request.stock_quantity / request.location_capacity 
                      : 0;
                    const ratioColor = getStockRatioColor(stockRatio);

                    return (
                      <tr 
                        key={request.id} 
                        className={`hover:bg-gray-50 transition-colors duration-150 
                          ${request.status === "completed" 
                            ? "cursor-pointer hover:bg-red-50" 
                            : "cursor-pointer hover:bg-blue-50"
                          }`}
                        onClick={() => handleRowClick(request)}
                      >
                        <td className="py-4 px-4 text-gray-700">
                          {request.id}
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-medium">
                          {request.product_number}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {formatDate(request.requested_at)}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {request.checked_at 
                            ? formatDate(request.checked_at)
                            : <span className="text-gray-400">未確認</span>
                          }
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <span className="capitalize">
                              {request.status === 'completed' ? '完了' :
                               request.status === 'pending' ? '処理中' :
                               request.status === 'cancelled' ? 'キャンセル' :
                               request.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {request.requested_by}
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-medium">
                          {request.stock_quantity != null 
                            ? `${request.stock_quantity.toLocaleString()} 個`
                            : '-'
                          }
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-medium">
                          {request.location_capacity != null && request.location_capacity > 0
                            ? `${request.location_capacity.toLocaleString()} 個`
                            : '-'
                          }
                        </td>
                        <td className={`py-4 px-4 font-medium ${ratioColor}`}>
                          {request.location_capacity != null && 
                           request.location_capacity > 0 && 
                           request.stock_quantity != null
                            ? `${(stockRatio * 100).toFixed(1)}%`
                            : '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ResponseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          stockRequest={selectedRequest}
          onSubmit={handleResponseSubmit}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
          }}
          onConfirm={handleDelete}
          stockRequest={requestToDelete}
        />
      </div>
    </ProtectedRoute>
  );
}