"use client";

import React, { useState } from "react";
import { 
  AlertCircle, 
  Box, 
  Layers, 
  RefreshCw, 
  Save, 
  X, 
  Info, 
  CheckCircle2 
} from "lucide-react";

type ProductDetail = {
  id: number;
  product_number: string;
  location_number: string;
  box_type: string;
};

type ModalProps = {
  product: ProductDetail | null;
  onClose: () => void;
};

// データの型を定義
type DatabaseData = {
  product_number: string;
  location_number?: string;
  overflow_quantity?: number;
  registered_at?: string;
  status?: string;
  requested_at?: string;
  requested_by?: string;
};

// Mock function to simulate database interaction
const mockDatabaseInsert = async (table: string, data: DatabaseData) => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`Mocking insert into ${table}:`, data);
  
  // Randomly simulate success or failure
  const isSuccess = Math.random() > 0.2;
  
  if (!isSuccess) {
    throw new Error(`Failed to insert data into ${table}`);
  }
  
  return { error: null };
};

const ProductModal = ({ product, onClose }: ModalProps) => {
  const [isOverflowModalOpen, setIsOverflowModalOpen] = useState(false);
  const [overflowQuantity, setOverflowQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handleStockRequest = async () => {
    const confirmAction = window.confirm("この品番の在庫確認を依頼しますか？");
    if (!confirmAction) return;

    try {
      const { error } = await mockDatabaseInsert("stock_requests", {
        product_number: product.product_number,
        requested_at: new Date().toISOString(),
        status: "pending",
        requested_by: "default_user",
      });

      if (error) {
        throw error;
      }

      alert("在庫確認依頼を登録しました。");
    } catch (error) {
      console.error("Error registering stock request:", error);
      alert("在庫確認依頼の登録に失敗しました。");
    }
  };

  const handleOverflowSubmit = async () => {
    const confirmAction = window.confirm("このオーバーフローを登録しますか？");
    if (!confirmAction) return;

    setIsSubmitting(true);

    const registeredAt = new Date().toISOString();

    try {
      const { error } = await mockDatabaseInsert("overflow_management", {
        product_number: product.product_number,
        location_number: product.location_number,
        overflow_quantity: overflowQuantity,
        registered_at: registeredAt,
      });

      if (error) {
        throw error;
      }

      alert("オーバーフローを登録しました。");
      setOverflowQuantity(0);
      setIsOverflowModalOpen(false);
    } catch (error) {
      console.error("Error registering overflow:", error);
      alert("オーバーフローの登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-1/3 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Info className="mr-2 text-blue-500" /> 
          製品詳細
        </h2>
        <div className="space-y-2">
          <p className="flex items-center">
            <Box className="mr-2 text-gray-500" />
            <strong>ID:</strong> {product.id}
          </p>
          <p className="flex items-center">
            <Layers className="mr-2 text-gray-500" />
            <strong>品番:</strong> {product.product_number}
          </p>
          <p className="flex items-center">
            <RefreshCw className="mr-2 text-gray-500" />
            <strong>ロケーション番号:</strong> {product.location_number}
          </p>
          <p className="flex items-center">
            <AlertCircle className="mr-2 text-gray-500" />
            <strong>箱種:</strong> {product.box_type}
          </p>
        </div>

        <div className="mt-6 flex space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleStockRequest}
          >
            <CheckCircle2 className="mr-2" />
            在庫確認依頼
          </button>

          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsOverflowModalOpen(true)}
          >
            <Save className="mr-2" />
            オーバーフロー登録
          </button>
        </div>

      {/* オーバーフロー登録用モーダル */}
      {isOverflowModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
          <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-blue-500" />
              オーバーフロー数量の入力
            </h2>

            <div className="mt-4 space-y-2">
              <p className="flex items-center">
                <Layers className="mr-2 text-gray-500" />
                <strong>品番:</strong> {product.product_number}
              </p>
              <p className="flex items-center">
                <RefreshCw className="mr-2 text-gray-500" />
                <strong>ロケーション番号:</strong> {product.location_number}
              </p>
              <p className="flex items-center">
                <Box className="mr-2 text-gray-500" />
                <strong>箱種:</strong> {product.box_type}
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="overflowQuantity" className="flex items-center text-sm font-medium text-gray-700">
                <AlertCircle className="mr-2 text-gray-500" />
                オーバーフロー数量
              </label>
              <input
                id="overflowQuantity"
                type="number"
                value={overflowQuantity}
                onChange={(e) => setOverflowQuantity(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min={0}
                placeholder="オーバーフロー数量を入力"
              />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleOverflowSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" />
                    登録
                  </>
                )}
              </button>

              <button
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setIsOverflowModalOpen(false)}
              >
                <X className="mr-2" />
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductModal;