import Link from 'next/link';
import { Box, Home, Layers, ClipboardList, QrCode } from 'lucide-react';  // QrCodeアイコンを追加
import "../globals.css";


export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-lg py-4 sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-300">
            出荷G
          </h1>
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            {[
              { href: "/products", icon: Box, label: "品番検索" },
              { href: "/inventory", icon: Home, label: "在庫確認状況" },
              { href: "/overflow", icon: Layers, label: "オーバーフロー" },
              { href: "/overflow-analysis-page", icon: ClipboardList, label: "オーバーフロー管理" },
              { href: "/qr-codes", icon: QrCode, label: "QRコード履歴" }  // 追加
            ].map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={`${label}ページへ移動`}
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 group"
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-sm font-medium group-hover:tracking-wider transition-all duration-300">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}