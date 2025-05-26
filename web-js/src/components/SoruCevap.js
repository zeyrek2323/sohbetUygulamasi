import React, { useState } from "react";
import axios from "axios";

const SoruCevap = ({ kategori }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acikKart, setAcikKart] = useState(null);

  // Kategoriye göre renk ve ikon
  const categoryColors = {
    "Tarih": "#f39c12",
    "Bilim": "#27ae60",
    "Spor": "#2980b9",
    "Teknoloji": "#8e44ad",
    "Müzik": "#e74c3c"
  };
  const categoryIcons = {
    "Tarih": "📜",
    "Bilim": "🔬",
    "Spor": "🏆",
    "Teknoloji": "💻",
    "Müzik": "🎵"
  };

  const color = categoryColors[kategori] || "#2196f3";
  const icon = categoryIcons[kategori] || "❓";

  const tarihOlaylari = {
    dunya: [
      {
        title: "Yazının İcadı (MÖ 3200, Sümerler)",
        desc: "İnsanlık tarihindeki en büyük dönüm noktalarından biridir. Sümerler'in çivi yazısını bulmasıyla birlikte bilgi artık sözlü değil, kalıcı biçimde aktarılmaya başlandı. Devlet kayıtları, ticaret belgeleri, yasalar ve dini metinler yazılı hale geldi. Tarihin başlangıcı da bu olayla tanımlanır, çünkü yazılı belgelerle geçmişin kaydı tutulmaya başlanmıştır."
      },
      {
        title: "Roma İmparatorluğu'nun Yıkılışı (MS 476)",
        desc: "Batı Roma'nın çökmesiyle Avrupa'da merkezi otorite parçalandı ve 'Karanlık Çağ' olarak bilinen Orta Çağ başladı. Feodal sistem gelişti, şehirler küçüldü, bilim ve sanat durağanlaştı. Bu çöküş, Avrupa'nın siyasi ve kültürel yapısını yüzyıllarca etkiledi. Aynı zamanda kilisenin gücü arttı ve modern Avrupa'nın temelleri bu dönemde atıldı."
      },
      {
        title: "İstanbul'un Fethi (1453, Osmanlılar)",
        desc: "Fatih Sultan Mehmet'in İstanbul'u almasıyla Bizans İmparatorluğu sona erdi. Bu fetihle Orta Çağ kapandı, Yeni Çağ başladı. Aynı zamanda Osmanlı, Avrupa ile Asya arasında büyük bir güç haline geldi. Bu olay, Avrupalıların yeni ticaret yolları aramasına neden olarak Coğrafi Keşifler'in başlamasını da tetikledi."
      },
      {
        title: "Sanayi Devrimi (18. yüzyıl sonları, İngiltere)",
        desc: "Buhar gücünün üretime entegre edilmesiyle üretim hızı ve kapasitesi olağanüstü arttı. Tarım toplumu yerini sanayi toplumuna bıraktı. Kentleşme hızlandı, işçi sınıfı oluştu ve kapitalist sistem güç kazandı. Sanayi Devrimi, modern dünyanın temel ekonomik, sosyal ve teknolojik yapısını şekillendirdi."
      },
      {
        title: "II. Dünya Savaşı (1939–1945)",
        desc: "70 milyondan fazla insanın hayatını kaybettiği bu küresel savaş, sadece askeri değil, siyasi ve teknolojik anlamda da büyük değişimlere yol açtı. Nazizm'in yenilgisiyle demokrasi ve insan hakları kavramları güç kazandı. Savaş sonrası iki süper güç (ABD ve SSCB) ortaya çıktı, Soğuk Savaş dönemi başladı. Aynı zamanda BM kuruldu, modern uluslararası düzenin temeli atıldı."
      }
    ],
    turkiye: [
      {
        title: "Malazgirt Meydan Muharebesi (1071)",
        desc: "Selçuklu Sultanı Alp Arslan, Bizans İmparatoru Romen Diyojen'i büyük bir bozguna uğrattı. Bu zaferle Anadolu'nun kapıları Türklere açıldı. Savaş sonrasında Türk boyları Anadolu'ya akın etmeye başladı, Anadolu zamanla bir Türk yurdu haline geldi. Türkiye'nin tarihsel temeli bu zaferle atıldı."
      },
      {
        title: "Osmanlı Devleti'nin Kuruluşu (1299)",
        desc: "Osman Gazi'nin Söğüt'te küçük bir beylik olarak başlattığı Osmanlı Devleti, kısa sürede büyük bir imparatorluğa dönüştü. 600 yılı aşkın süre boyunca üç kıtada hüküm süren Osmanlı, İslam dünyasının lideri haline geldi. Türk-İslam sentezinin oluştuğu bu dönemde hukuk, mimari, edebiyat ve diplomasi gelişti."
      },
      {
        title: "İstanbul'un Fethi (1453)",
        desc: "Fatih Sultan Mehmet'in liderliğinde Osmanlı ordusu, Bizans İmparatorluğu'na son vererek İstanbul'u fethetti. Bu olay sadece çağ değiştirici bir zafer değil, aynı zamanda Osmanlı'nın bir dünya gücü olduğunu ilan etmesidir. İstanbul, imparatorluğun başkenti olmuş, bilim, sanat ve kültürün merkezi haline gelmiştir."
      },
      {
        title: "Kurtuluş Savaşı (1919–1923)",
        desc: "Mondros Ateşkes Antlaşması sonrası Anadolu işgal edilince Mustafa Kemal Paşa önderliğinde başlatılan milli direniş hareketi, işgalci güçlere karşı tam bağımsızlık hedefiyle yürütüldü. Sakarya, Dumlupınar gibi savaşlarla başarı kazanıldı. Sonuçta Türkiye Cumhuriyeti'nin temelleri atıldı ve Türk milleti bağımsızlığını yeniden kazandı."
      },
      {
        title: "Türkiye Cumhuriyeti'nin Kuruluşu (1923)",
        desc: "29 Ekim 1923'te Mustafa Kemal Atatürk'ün önderliğinde cumhuriyet ilan edildi. Saltanat kaldırıldı, halk egemenliği esas alındı. Laiklik, hukuk reformları, eğitim ve kadın haklarında yapılan köklü değişikliklerle Türkiye modern bir ulus-devlet haline geldi. Bu dönüşüm, Türk milletinin çağdaş dünyaya entegre olmasının temelini oluşturdu."
      }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await axios.post("/api/questions", {
        question,
        kategori,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Bir hata oluştu, lütfen tekrar deneyin."
      );
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(44,62,80,0.10)",
        padding: 32,
        marginTop: 24,
        marginBottom: 24,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <span style={{
          fontSize: 38,
          marginRight: 14,
          background: color,
          borderRadius: "50%",
          width: 54,
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: `0 2px 8px ${color}33`
        }}>{icon}</span>
        <span style={{
          fontWeight: 800,
          fontSize: 32,
          color: color,
          letterSpacing: 1
        }}>{kategori} Soru-Cevap</span>
      </div>
      {/* Bilgi Kartları */}
      {kategori === "Tarih" && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color, fontWeight: 800, fontSize: 26, marginBottom: 10 }}>Dünya Tarihini Değiştiren 5 Olay</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {tarihOlaylari.dunya.map((olay, idx) => (
              <button
                key={idx}
                onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                style={{
                  background: '#f4f9ff',
                  border: `2px solid ${color}`,
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #e3e3e3',
                  color: color,
                  transition: 'background 0.2s',
                }}
              >
                {olay.title.split('(')[0].trim()}
              </button>
            ))}
          </div>
          <h2 style={{ color, fontWeight: 800, fontSize: 26, marginBottom: 10 }}>Türkiye Tarihini Değiştiren 5 Olay</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {tarihOlaylari.turkiye.map((olay, idx) => (
              <button
                key={idx}
                onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                style={{
                  background: '#f4f9ff',
                  border: `2px solid ${color}`,
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #e3e3e3',
                  color: color,
                  transition: 'background 0.2s',
                }}
              >
                {olay.title.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Sorunuzu yazın..."
          rows={3}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 14,
            borderRadius: 10,
            border: `2px solid ${color}`,
            fontSize: 18,
            resize: "vertical",
            outline: "none",
            boxShadow: "0 2px 8px #eee",
            boxSizing: "border-box"
          }}
          required
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            background: `linear-gradient(90deg, ${color} 0%, #fff200 100%)`,
            color: "#222",
            border: "none",
            borderRadius: 10,
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: 18,
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
            boxShadow: `0 2px 8px ${color}22`,
            transition: "background 0.2s"
          }}
        >
          {loading ? "Cevaplanıyor..." : "Sor"}
        </button>
      </form>
      {answer && (
        <div
          style={{
            background: "#f4f9ff",
            marginTop: 28,
            padding: 20,
            borderRadius: 12,
            borderLeft: `6px solid ${color}`,
            fontSize: 18,
            color: "#222",
            boxShadow: "0 2px 8px #e3e3e3",
            animation: "fadeIn 0.7s"
          }}
        >
          <strong style={{ color }}>{icon} Cevap:</strong>
          <div style={{ marginTop: 8 }}>{answer}</div>
        </div>
      )}
      {error && (
        <div
          style={{
            color: "#fff",
            background: "#e74c3c",
            marginTop: 18,
            padding: 12,
            borderRadius: 8,
            fontWeight: 600,
            boxShadow: "0 2px 8px #e74c3c33"
          }}
        >
          <strong>Hata:</strong> {error}
        </div>
      )}
      {/* Açık Kart */}
      {acikKart && (
        <div
          style={{
            background: '#fffbe7',
            border: `3px solid ${color}`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
            boxShadow: '0 4px 24px #f9e79f55',
            position: 'relative',
            animation: 'fadeIn 0.5s',
            maxWidth: 600,
            margin: '0 auto 28px auto',
          }}
        >
          <button
            onClick={() => setAcikKart(null)}
            style={{
              position: 'absolute',
              top: 12,
              right: 18,
              background: '#f39c12',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #f39c1233',
            }}
          >
            Kapat
          </button>
          <h3 style={{ color, fontWeight: 800, fontSize: 22, marginBottom: 12 }}>{acikKart.title}</h3>
          <div style={{ color: '#222', fontSize: 18 }}>{acikKart.desc}</div>
        </div>
      )}
    </div>
  );
};

export default SoruCevap; 