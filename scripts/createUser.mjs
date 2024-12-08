import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config();

// Supabase URL と API キーを環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase クライアントのインスタンスを作成
const supabase = createClient(supabaseUrl, supabaseKey);

// ユーザー作成関数
async function createUser() {
  try {
    // サインアップ (ユーザー登録)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'manmanmeerkat@gmail.com', // 登録するメールアドレス
      password: 'password123',          // 登録するパスワード
    });

    if (signUpError) {
      console.error('Error creating user:', signUpError.message);
      return;
    }

    console.log('User created successfully:', signUpData.user);

    // サインインしてセッションを取得
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'manmanmeerkat@gmail.com',
      password: 'password123',
    });

    if (signInError) {
      console.error('Error signing in:', signInError.message);
      return;
    }

    console.log('User signed in successfully.');

    // ユーザーのメタデータを更新
    const { error: updateError } = await supabase.auth.updateUser({
      data: { displayName: '熊沢' }, // 名前を user_metadata に追加
    });

    if (updateError) {
      console.error('Error updating user metadata:', updateError.message);
      return;
    }

    console.log('User metadata updated successfully.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// ユーザー作成を実行
createUser();
