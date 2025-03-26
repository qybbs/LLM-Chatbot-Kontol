use ic_cdk::update;
use ic_llm::{ChatMessage, Model, Role};

const KNOWLEDGE_B2B_NEGOTIATION_ID: &str = r#"
Anda adalah Asisten Negosiasi B2B. Tugas Anda adalah membantu dalam strategi negosiasi bisnis.
Berikut prinsip utama:
1. Pendekatan Win-Win: Cari solusi yang menguntungkan kedua belah pihak.
2. Nilai Lebih dari Harga: Tekankan manfaat jangka panjang, bukan hanya biaya.
3. BATNA: Miliki alternatif terbaik jika negosiasi gagal.
4. Anchoring: Mulailah dengan penawaran awal yang menguntungkan.
5. Mirroring & Labeling: Bangun kepercayaan dengan mengulang dan mengonfirmasi pernyataan.

Contoh skenario:
- Jika klien mengatakan: 'Harga Anda terlalu mahal,' jawab dengan menekankan nilai produk, bukan sekadar menurunkan harga.
- Jika klien ragu, berikan informasi tambahan untuk membantu keputusan mereka.
- Jika klien menawarkan harga rendah, sarankan penyesuaian lingkup kerja daripada langsung menyetujui.

Selalu gunakan bahasa yang profesional dan persuasif dalam negosiasi. Buat jawaban tidak melebihi batas 200 token
"#;

#[update]
async fn prompt(prompt_str: String) -> String {
    let full_prompt = format!("{}\n\nPengguna: {}\nAsisten:", KNOWLEDGE_B2B_NEGOTIATION_ID, prompt_str);
    let mut response = ic_llm::prompt(Model::Llama3_1_8B, full_prompt).await;

    // Jika respons terpotong, minta lanjutan
    while response.len() >= 190 {  // Gunakan 190 sebagai buffer sebelum mencapai batas 200 token
        let follow_up = format!("Lanjutkan jawaban sebelumnya.");
        let next_response = ic_llm::prompt(Model::Llama3_1_8B, follow_up).await;
        response.push_str(&next_response);
        
        // Jika sudah tidak ada tambahan informasi, hentikan
        if next_response.len() < 190 {
            break;
        }
    }

    response
}

#[update]
async fn chat(messages: Vec<ChatMessage>) -> String {
    let mut updated_messages = messages;

    // Knowledge Injection - mengubah string menjadi ChatMessage
    updated_messages.push(ChatMessage {
        role: Role::System,  // Menggunakan enum Role::System alih-alih string
        content: KNOWLEDGE_B2B_NEGOTIATION_ID.to_string()
    });

    let mut response = ic_llm::chat(Model::Llama3_1_8B, updated_messages).await;

    // Jika respons terpotong, minta lanjutan
    while response.len() >= 190 {  // Gunakan 190 sebagai buffer sebelum mencapai batas 200 token
        let follow_up = vec![
            ChatMessage {
                role: Role::System,  // Menggunakan enum Role::System alih-alih string
                content: "Lanjutkan jawaban sebelumnya".to_string()
            }
        ];
        let next_response = ic_llm::chat(Model::Llama3_1_8B, follow_up).await;
        response.push_str(&next_response);
        
        // Jika sudah tidak ada tambahan informasi, hentikan
        if next_response.len() < 190 {
            break;
        }
    }

    response
}

// Export the interface for the smart contract.
ic_cdk::export_candid!();