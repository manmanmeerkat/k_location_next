import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";

type ProductDetail = {
  id: number;
  product_number: string;
  location_number: string;
  description: string;
};

type ModalProps = {
  product: ProductDetail | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ModalProps) {
  const [overflowQuantity, setOverflowQuantity] = useState<number>(0); // オーバーフロー数量の管理
  const [boxType, setBoxType] = useState<string>("A"); // 箱の種類の管理

  if (!product) return null;

  // 在庫確認依頼
  const handleStockRequest = async () => {
    const confirmAction = window.confirm("この品番の在庫確認を依頼しますか？");
    if (!confirmAction) return;

    const { error } = await supabase.from("stock_requests").insert([
      {
        product_number: product.product_number,
        requested_at: new Date().toISOString(),
        status: "pending",
        requested_by: "default_user", // 仮の値
      },
    ]);

    if (error) {
      console.error("Error registering stock request:", error);
      alert("在庫確認依頼の登録に失敗しました。");
    } else {
      alert("在庫確認依頼を登録しました。");
    }
  };

  // オーバーフロー登録
  const handleOverflowSubmit = async () => {
    const confirmAction = window.confirm("このオーバーフローを登録しますか？");
    if (!confirmAction) return;

    const { error } = await supabase.from("overflow_management").insert([
      {
        product_number: product.product_number,
        overflow_quantity: overflowQuantity,
        box_type: boxType, // 箱の種類を保存
        registered_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error registering overflow:", error);
      alert("オーバーフローの登録に失敗しました。");
    } else {
      alert("オーバーフローを登録しました。");
      setOverflowQuantity(0); // 入力フィールドのリセット
      setBoxType("A"); // 箱の種類のリセット
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">製品詳細</h2>
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>品番:</strong> {product.product_number}</p>
        <p><strong>ロケーション番号:</strong> {product.location_number}</p>
        <p><strong>説明:</strong> {product.description || "情報なし"}</p>

        <div className="mt-4">
          <label htmlFor="overflowQuantity" className="block font-bold">
            オーバーフロー数量:
          </label>
          <input
            type="number"
            id="overflowQuantity"
            value={overflowQuantity}
            onChange={(e) => setOverflowQuantity(Number(e.target.value))}
            className="border rounded px-4 py-2 w-full"
            min="0"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="boxType" className="block font-bold">
            箱の種類:
          </label>
          <select
            id="boxType"
            value={boxType}
            onChange={(e) => setBoxType(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G">G</option>
            <option value="H">H</option>
          </select>
        </div>

        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleStockRequest}
        >
          在庫確認依頼
        </button>

        <button
          className="mt-4 ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleOverflowSubmit}
        >
          オーバーフロー登録
        </button>

        <button
          className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
