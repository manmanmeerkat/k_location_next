"use client";

import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { XCircle, CheckCircle, Layers, Package, ClipboardList, AlertTriangle } from "lucide-react";

type ProductDetail = {
  product_number: string;
  location_number: string;
  box_type: string;
  location_capacity: number;
};

type ModalProps = {
  product: ProductDetail | null;
  onClose: () => void;
};

type OverflowReason = '作り過ぎ' | '出てくるのが早い' | '在庫は少ないがロケが小さい' | 'その他';

const ProductModal = ({ product, onClose }: ModalProps) => {
  const [isOverflowModalOpen, setIsOverflowModalOpen] = useState(false);
  const [overflowQuantity, setOverflowQuantity] = useState<number>(0);
  const [overflowReason, setOverflowReason] = useState<OverflowReason | ''>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const resetForm = () => {
    setOverflowQuantity(0);
    setOverflowReason('');
    setCustomReason('');
    setError(null);
  };

  const handleStockRequest = async () => {
    try {
      const confirmAction = window.confirm("この品番の在庫確認を依頼しますか？");
      if (!confirmAction) return;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("ユーザーが認証されていません");
      }

      const { error: insertError } = await supabase
        .from("stock_requests")
        .insert([{
          product_number: product.product_number,
          requested_at: new Date().toISOString(),
          status: "pending",
          requested_by: user.user_metadata.displayName,
        }]);

      if (insertError) throw insertError;

      alert("在庫確認依頼を登録しました。");
    } catch (err) {
      console.error("Error in stock request:", err);
      alert("在庫確認依頼の登録に失敗しました。");
    }
  };

  const handleOverflowSubmit = async () => {
    try {
      setError(null);

      if (!overflowReason) {
        throw new Error("オーバーフローの理由を選択してください。");
      }

      if (overflowReason === "その他" && !customReason.trim()) {
        throw new Error("オーバーフローの理由を入力してください。");
      }

      if (overflowQuantity <= 0) {
        throw new Error("有効な数量を入力してください。");
      }

      const finalReason = overflowReason === "その他" ? customReason.trim() : overflowReason;

      const confirmMessage = `以下の内容で登録しますか？\n\n品番: ${product.product_number}\n数量: ${overflowQuantity}\n理由: ${finalReason}`;
      if (!window.confirm(confirmMessage)) return;

      setIsSubmitting(true);

      const { error: insertError } = await supabase
        .from("overflow_management")
        .insert({
          product_number: product.product_number,
          overflow_quantity: overflowQuantity,
          overflow_reason: finalReason,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("オーバーフローの登録に失敗しました。");
      }

      alert("オーバーフローを登録しました。");
      resetForm();
      setIsOverflowModalOpen(false);

    } catch (error) {
      console.error("Error in overflow registration:", error);
      setError(error instanceof Error ? error.message : "登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <XCircle size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Layers size={24} className="text-indigo-500" />
          <span>製品詳細</span>
        </h2>

        <div className="space-y-4">
          <p className="flex items-center space-x-2">
            <Layers size={18} className="text-blue-500" />
            <span className="font-bold">品番:</span>
            <span>{product.product_number}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Package size={18} className="text-green-500" />
            <span className="font-bold">ロケーション番号:</span>
            <span>{product.location_number}</span>
          </p>
          <p className="flex items-center space-x-2">
            <ClipboardList size={18} className="text-orange-500" />
            <span className="font-bold">箱種:</span>
            <span>{product.box_type}</span>
          </p>
          <p className="flex items-center space-x-2">
            <ClipboardList size={18} className="text-yellow-500" />
            <span className="font-bold">ロケーション容量:</span>
            <span>{product.location_capacity}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2 transition-colors"
            onClick={handleStockRequest}
          >
            <CheckCircle size={18} />
            <span>在庫確認依頼</span>
          </button>

          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 transition-colors"
            onClick={() => {
              resetForm();
              setIsOverflowModalOpen(true);
            }}
          >
            <ClipboardList size={18} />
            <span>オーバーフロー登録</span>
          </button>
        </div>
      </div>

      {isOverflowModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
            <button
              onClick={() => {
                setIsOverflowModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <XCircle size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <ClipboardList size={24} className="text-indigo-500" />
              <span>オーバーフロー登録</span>
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="overflowQuantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  オーバーフロー数量
                </label>
                <input
                  id="overflowQuantity"
                  type="number"
                  value={overflowQuantity}
                  onChange={(e) => setOverflowQuantity(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min={1}
                  required
                  placeholder="数量を入力"
                />
              </div>

              <div>
                <label
                  htmlFor="overflowReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  オーバーフローの理由
                </label>
                <select
                  id="overflowReason"
                  value={overflowReason}
                  onChange={(e) => {
                    setOverflowReason(e.target.value as OverflowReason);
                    if (e.target.value !== "その他") {
                      setCustomReason('');
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="作り過ぎ">作り過ぎ</option>
                  <option value="出てくるのが早い">出てくるのが早い</option>
                  <option value="在庫は少ないがロケが小さい">在庫は少ないがロケが小さい</option>
                  <option value="その他">その他</option>
                </select>

                {overflowReason === "その他" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="理由を入力してください"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">登録する品番: {product.product_number}</p>
                <p className="text-sm text-gray-600">ロケーション番号: {product.location_number}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsOverflowModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <XCircle size={18} />
                <span>キャンセル</span>
              </button>
              <button
                onClick={handleOverflowSubmit}
                disabled={isSubmitting || !overflowReason || overflowQuantity <= 0 || (overflowReason === "その他" && !customReason.trim())}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>{isSubmitting ? "登録中..." : "登録する"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;