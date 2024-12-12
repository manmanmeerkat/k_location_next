import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { XCircle, CheckCircle, Layers, Package, ClipboardList } from "lucide-react";

// Productテーブルの定義に基づいた型
type ProductDetail = {
  product_number: string;  // 製品番号
  location_number: string; // ロケーション番号
  box_type: string;        // 箱種
  location_capacity: number; // ロケーション容量
};

type ModalProps = {
  product: ProductDetail | null;
  onClose: () => void;
};

const ProductModal = ({ product, onClose }: ModalProps) => {
  const [isOverflowModalOpen, setIsOverflowModalOpen] = useState(false);
  const [overflowQuantity, setOverflowQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  // 在庫確認依頼
  const handleStockRequest = async () => {
    const confirmAction = window.confirm("この品番の在庫確認を依頼しますか？");
    if (!confirmAction) return;

    // 認証ユーザーの情報を取得
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error("ユーザーが認証されていません:", error);
      alert("ユーザーが認証されていません。");
      return;
    }

    // 在庫確認依頼の登録
    const { error: insertError } = await supabase.from("stock_requests").insert([{
      product_number: product.product_number,
      requested_at: new Date().toISOString(),
      status: "pending",
      requested_by: user.user_metadata.displayName, // ユーザーの表示名
    }]);

    if (insertError) {
      console.error("Error registering stock request:", insertError);
      alert("在庫確認依頼の登録に失敗しました。");
    } else {
      alert("在庫確認依頼を登録しました。");
    }
  };

  // オーバーフロー登録
  const handleOverflowSubmit = async () => {
    const confirmAction = window.confirm("このオーバーフローを登録しますか？");
    if (!confirmAction) return;

    setIsSubmitting(true);


    const { error } = await supabase.from("overflow_management").insert([{
      product_number: product.product_number,
      overflow_quantity: overflowQuantity,
    }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error registering overflow:", error);
      alert("オーバーフローの登録に失敗しました。");
    } else {
      alert("オーバーフローを登録しました。");
      setOverflowQuantity(0);
      setIsOverflowModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
        {/* 閉じるボタン */}
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
            <span className="font-bold">品番:</span> <span>{product.product_number}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Package size={18} className="text-green-500" />
            <span className="font-bold">ロケーション番号:</span> <span>{product.location_number}</span>
          </p>
          <p className="flex items-center space-x-2">
            <ClipboardList size={18} className="text-orange-500" />
            <span className="font-bold">箱種:</span> <span>{product.box_type}</span>
          </p>
          <p className="flex items-center space-x-2">
            <ClipboardList size={18} className="text-yellow-500" />
            <span className="font-bold">ロケーション容量:</span> <span>{product.location_capacity}</span>
          </p>
        </div>

        {/* ボタンセクション */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            onClick={handleStockRequest}
          >
            <CheckCircle size={18} />
            <span>在庫確認依頼</span>
          </button>

          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            onClick={() => setIsOverflowModalOpen(true)}
          >
            <ClipboardList size={18} />
            <span>オーバーフロー登録</span>
          </button>
        </div>
      </div>

      {/* オーバーフロー入力モーダル */}
      {isOverflowModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
            <button
              onClick={() => setIsOverflowModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <XCircle size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <ClipboardList size={24} className="text-indigo-500" />
              <span>オーバーフロー数量の入力</span>
            </h2>

            <label
              htmlFor="overflowQuantity"
              className="block text-sm font-medium text-gray-700"
            >
              オーバーフロー数量
            </label>
            <input
              id="overflowQuantity"
              type="number"
              value={overflowQuantity}
              onChange={(e) => setOverflowQuantity(Number(e.target.value))}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min={0}
              placeholder="オーバーフロー数量を入力"
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleOverflowSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <CheckCircle size={18} />
                <span>{isSubmitting ? "登録中..." : "登録"}</span>
              </button>

              <button
                onClick={() => setIsOverflowModalOpen(false)}
                className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              >
                <XCircle size={18} />
                <span>閉じる</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;
