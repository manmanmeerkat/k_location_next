// src/components/Header.tsx

import Link from 'next/link';
import { FaHome, FaBox, FaGg } from 'react-icons/fa';  // アイコンを追加

export default function Header() {

  // オーバーフロー一覧の表示/非表示を切り替える関数
 

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white shadow-xl py-4">
      <div className="container mx-auto px-6 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-500 to-yellow-300">
          出荷G
        </h1>
        <nav>
          <ul className="flex space-x-12 items-center">
            <li>
              <Link href="/products" aria-label="品番検索ページへ移動" className="text-lg hover:text-pink-400 transition-all duration-300 flex items-center space-x-2">
                <FaBox size={20} />
                <span>品番検索</span>
              </Link>
            </li>
            <li>
              <Link href="/inventory" aria-label="在庫確認ページへ移動" className="text-lg hover:text-pink-400 transition-all duration-300 flex items-center space-x-2">
                <FaHome size={20} />
                <span>在庫確認</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/overflow" 
                aria-label="オーバーフローページへ移動" 
                className="text-lg hover:text-pink-400 transition-all duration-300 flex items-center space-x-2"
              >
                <FaGg size={20} />
                <span>オーバーフロー</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* オーバーフロー一覧が表示される部分 */}
    </header>
  );
}
