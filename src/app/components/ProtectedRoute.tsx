"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabase";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login"); // ログインページにリダイレクト
      }
    };

    checkSession();
  }, [router]);

  return <>{children}</>; // 認証済みの場合のみ子要素をレンダリング
}
