import { supabase } from "../utils/supabase"

async function seed() {
  // ダミーデータを挿入する処理を記述
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        product_number: '12345-67890-71',
        location_number: '123456',
      },
      // 追加のデータを挿入する処理
    ])
  
  if (error) {
    console.error('Error seeding data:', error)
  } else {
    console.log('Data seeded successfully:', data)
  }
}

seed()
