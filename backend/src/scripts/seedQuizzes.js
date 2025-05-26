const mongoose = require('mongoose');
const Quiz = require('../models/quiz.model');

const quizzes = [
  // TARİH TEST-1
  {
    question: "Osmanlı İmparatorluğu'nun kurucusu kimdir?",
    options: ["Osman Bey", "Orhan Bey", "Ertuğrul Gazi", "Alparslan"],
    correctAnswer: "Osman Bey",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "İstanbul hangi yılda fethedildi?",
    options: ["1453", "1071", "1923", "1299"],
    correctAnswer: "1453",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Cumhuriyet ne zaman ilan edildi?",
    options: ["1920", "1923", "1938", "1919"],
    correctAnswer: "1923",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Kurtuluş Savaşı hangi yıl başladı?",
    options: ["1919", "1923", "1938", "1945"],
    correctAnswer: "1919",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 1
  },
  {
    question: "Malazgirt Meydan Muharebesi hangi yıl yapıldı?",
    options: ["1071", "1453", "1923", "1517"],
    correctAnswer: "1071",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 1
  },
  // TARİH TEST-2
  {
    question: "Anadolu Selçuklu Devleti'nin başkenti neresidir?",
    options: ["Konya", "İznik", "Bursa", "Sivas"],
    correctAnswer: "Konya",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Atatürk'ün doğum yılı nedir?",
    options: ["1881", "1876", "1893", "1905"],
    correctAnswer: "1881",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Lozan Antlaşması hangi yıl imzalandı?",
    options: ["1923", "1919", "1938", "1945"],
    correctAnswer: "1923",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Türkiye Cumhuriyeti'nin ilk başbakanı kimdir?",
    options: ["İsmet İnönü", "Celal Bayar", "Recep Tayyip Erdoğan", "Turgut Özal"],
    correctAnswer: "İsmet İnönü",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Osmanlı'da Tanzimat Fermanı hangi padişah döneminde ilan edildi?",
    options: ["Abdülmecid", "II. Mahmud", "Abdülhamid II", "IV. Murad"],
    correctAnswer: "Abdülmecid",
    category: "Tarih",
    difficulty: "Zor",
    testNo: 2
  },
  // BİLİM TEST-1
  {
    question: "Hangi element periyodik tabloda 'Fe' sembolü ile gösterilir?",
    options: ["Flor", "Demir", "Fosfor", "Fermiyum"],
    correctAnswer: "Demir",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 1
  },
  {
    question: "Dünyanın en büyük gezegeni hangisidir?",
    options: ["Mars", "Venüs", "Jüpiter", "Satürn"],
    correctAnswer: "Jüpiter",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Suyun kimyasal formülü nedir?",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correctAnswer: "H2O",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "İnsan vücudunda en çok bulunan element hangisidir?",
    options: ["Oksijen", "Karbon", "Hidrojen", "Azot"],
    correctAnswer: "Oksijen",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "DNA'nın açılımı nedir?",
    options: ["Deoksiribonükleik Asit", "Dinamik Nükleik Asit", "Dizayn Nükleik Asit", "Dijital Nükleik Asit"],
    correctAnswer: "Deoksiribonükleik Asit",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 1
  },
  // BİLİM TEST-2
  {
    question: "Einstein'ın ünlü denklemi nedir?",
    options: ["E=mc^2", "F=ma", "a^2+b^2=c^2", "PV=nRT"],
    correctAnswer: "E=mc^2",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Hücre teorisini kim geliştirmiştir?",
    options: ["Schleiden & Schwann", "Newton", "Curie", "Darwin"],
    correctAnswer: "Schleiden & Schwann",
    category: "Bilim",
    difficulty: "Zor",
    testNo: 2
  },
  {
    question: "Işığın hızı yaklaşık olarak kaç km/saniyedir?",
    options: ["300.000", "150.000", "1.000", "30.000"],
    correctAnswer: "300.000",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Bir atomun çekirdeğinde hangi parçacıklar bulunur?",
    options: ["Proton ve Nötron", "Elektron ve Proton", "Nötron ve Elektron", "Sadece Proton"],
    correctAnswer: "Proton ve Nötron",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "İlk antibiyotik nedir?",
    options: ["Penisilin", "Aspirin", "Paracetamol", "İbuprofen"],
    correctAnswer: "Penisilin",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 2
  },
  // SPOR TEST-1
  {
    question: "Hangi spor dalı 'Kral Spor' olarak bilinir?",
    options: ["Futbol", "Tenis", "Golf", "Basketbol"],
    correctAnswer: "Futbol",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "NBA hangi ülkenin basketbol ligidir?",
    options: ["ABD", "İngiltere", "İspanya", "Türkiye"],
    correctAnswer: "ABD",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Olimpiyat Oyunları kaç yılda bir düzenlenir?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "4",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Dünyanın en hızlı koşucusu kimdir?",
    options: ["Usain Bolt", "Carl Lewis", "Mo Farah", "Justin Gatlin"],
    correctAnswer: "Usain Bolt",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "FIFA Dünya Kupası ilk kez hangi yıl düzenlendi?",
    options: ["1930", "1950", "1966", "1974"],
    correctAnswer: "1930",
    category: "Spor",
    difficulty: "Orta",
    testNo: 1
  },
  // SPOR TEST-2
  {
    question: "Teniste 0-0 skoru ne olarak adlandırılır?",
    options: ["Love", "Zero", "Null", "Start"],
    correctAnswer: "Love",
    category: "Spor",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Türkiye'nin en çok şampiyon olan futbol takımı hangisidir?",
    options: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor"],
    correctAnswer: "Galatasaray",
    category: "Spor",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Formula 1'de en çok şampiyon olan pilot kimdir?",
    options: ["Michael Schumacher", "Lewis Hamilton", "Ayrton Senna", "Sebastian Vettel"],
    correctAnswer: "Lewis Hamilton",
    category: "Spor",
    difficulty: "Zor",
    testNo: 2
  },
  {
    question: "Voleybol sahasında kaç oyuncu bulunur?",
    options: ["6", "5", "7", "8"],
    correctAnswer: "6",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Basketbolda üç sayılık atış çizgisi kaç metredir?",
    options: ["6.75", "7.24", "5.80", "8.00"],
    correctAnswer: "6.75",
    category: "Spor",
    difficulty: "Zor",
    testNo: 2
  },
  // TEKNOLOJİ TEST-1
  {
    question: "İlk iPhone hangi yılda tanıtıldı?",
    options: ["2005", "2006", "2007", "2008"],
    correctAnswer: "2007",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 1
  },
  {
    question: "Dünyanın ilk programcısı olarak kabul edilen kişi kimdir?",
    options: ["Ada Lovelace", "Alan Turing", "Bill Gates", "Steve Jobs"],
    correctAnswer: "Ada Lovelace",
    category: "Teknoloji",
    difficulty: "Zor",
    testNo: 1
  },
  {
    question: "HTML'in açılımı nedir?",
    options: ["HyperText Markup Language", "HighText Machine Language", "HyperTabular Markup Language", "None"],
    correctAnswer: "HyperText Markup Language",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Google hangi yıl kuruldu?",
    options: ["1998", "2000", "1995", "2004"],
    correctAnswer: "1998",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "En çok kullanılan işletim sistemi hangisidir?",
    options: ["Windows", "Linux", "macOS", "Android"],
    correctAnswer: "Windows",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 1
  },
  // TEKNOLOJİ TEST-2
  {
    question: "Yapay zekanın kısaltması nedir?",
    options: ["AI", "ML", "DL", "NN"],
    correctAnswer: "AI",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "İlk bilgisayar virüsünün adı nedir?",
    options: ["Creeper", "ILOVEYOU", "Melissa", "Stuxnet"],
    correctAnswer: "Creeper",
    category: "Teknoloji",
    difficulty: "Zor",
    testNo: 2
  },
  {
    question: "Bir byte kaç bittir?",
    options: ["8", "16", "32", "64"],
    correctAnswer: "8",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Python programlama dilinin logosunda hangi hayvan vardır?",
    options: ["Yılan", "Kedi", "Köpek", "Kuş"],
    correctAnswer: "Yılan",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "RAM neyin kısaltmasıdır?",
    options: ["Random Access Memory", "Read Access Memory", "Run All Memory", "Rapid Access Module"],
    correctAnswer: "Random Access Memory",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 2
  },
  // MÜZİK TEST-1
  {
    question: "Hangi müzik aleti 'Keman Ailesi'nin en büyük üyesidir?",
    options: ["Keman", "Viyola", "Viyolonsel", "Kontrbas"],
    correctAnswer: "Kontrbas",
    category: "Müzik",
    difficulty: "Zor",
    testNo: 1
  },
  {
    question: "Beethoven hangi dönemin bestecisidir?",
    options: ["Klasik", "Barok", "Romantik", "Modern"],
    correctAnswer: "Klasik",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 1
  },
  {
    question: "Bir oktavda kaç nota vardır?",
    options: ["7", "8", "12", "6"],
    correctAnswer: "8",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 1
  },
  {
    question: "Türk Sanat Müziği'nde kullanılan makam türlerinden biri değildir?",
    options: ["Rast", "Hicaz", "Segah", "Allegro"],
    correctAnswer: "Allegro",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 1
  },
  {
    question: "Dünyaca ünlü 'Bohemian Rhapsody' şarkısı hangi grubun eseridir?",
    options: ["Queen", "The Beatles", "Pink Floyd", "Led Zeppelin"],
    correctAnswer: "Queen",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 1
  },
  // MÜZİK TEST-2
  {
    question: "Nota anahtarı olarak kullanılan sembol hangisidir?",
    options: ["Sol", "Fa", "Do", "Mi"],
    correctAnswer: "Sol",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Piyano kaç tuşludur?",
    options: ["88", "76", "61", "100"],
    correctAnswer: "88",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Hangi müzik türü Amerika'da doğmuştur?",
    options: ["Caz", "Klasik", "Opera", "Reggae"],
    correctAnswer: "Caz",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 2
  },
  {
    question: "Bir orkestra şefi hangi aleti kullanır?",
    options: ["Baton", "Keman", "Piyano", "Davul"],
    correctAnswer: "Baton",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 2
  },
  {
    question: "Türk Halk Müziği'nde en çok kullanılan çalgı hangisidir?",
    options: ["Bağlama", "Keman", "Zurna", "Darbuka"],
    correctAnswer: "Bağlama",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 2
  },
  // TARİH TEST-3
  {
    question: "Fransız İhtilali hangi yılda gerçekleşmiştir?",
    options: ["1776", "1789", "1804", "1815"],
    correctAnswer: "1789",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "Osmanlı Devleti'ni resmi olarak sona erdiren antlaşma hangisidir?",
    options: ["Mondros", "Sevr", "Lozan", "Berlin"],
    correctAnswer: "Lozan",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "I. Dünya Savaşı'nda Osmanlı Devleti'nin savaştığı cephelerden biri değildir:",
    options: ["Çanakkale", "Kafkas", "Normandiya", "Hicaz"],
    correctAnswer: "Normandiya",
    category: "Tarih",
    difficulty: "Zor",
    testNo: 3
  },
  {
    question: "Amerika Birleşik Devletleri'nin bağımsızlığını kazandığı yıl hangisidir?",
    options: ["1492", "1620", "1776", "1800"],
    correctAnswer: "1776",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "1923 yılında Türkiye Cumhuriyeti ilan edildiğinde ilk Cumhurbaşkanı kim oldu?",
    options: ["İsmet İnönü", "Rauf Orbay", "Mustafa Kemal Atatürk", "Kazım Karabekir"],
    correctAnswer: "Mustafa Kemal Atatürk",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 3
  },
  // TARİH TEST-4
  {
    question: "Magna Carta hangi ülkede imzalanmıştır?",
    options: ["Fransa", "Almanya", "İngiltere", "İtalya"],
    correctAnswer: "İngiltere",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Soğuk Savaş döneminde kurulan NATO'nun açılımı nedir?",
    options: ["North Asian Treaty Organization", "Northern American Treaty Organization", "North Atlantic Treaty Organization", "National Alliance of Treaty Organizations"],
    correctAnswer: "North Atlantic Treaty Organization",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Osmanlı Devleti'nde \"Lale Devri\" hangi padişah döneminde yaşanmıştır?",
    options: ["II. Mahmud", "III. Ahmet", "I. Abdülhamit", "IV. Murat"],
    correctAnswer: "III. Ahmet",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: "2. Dünya Savaşı'nın başlama sebebi olarak kabul edilen ülke işgali hangisidir?",
    options: ["Almanya'nın Polonya'yı işgali", "Japonya'nın Çin'i işgali", "İtalya'nın Etiyopya'yı işgali", "Sovyetler'in Finlandiya'yı işgali"],
    correctAnswer: "Almanya'nın Polonya'yı işgali",
    category: "Tarih",
    difficulty: "Zor",
    testNo: 4
  },
  {
    question: "Mustafa Kemal Atatürk, hangi savaşta 'Ben size taarruzu değil ölmeyi emrediyorum!' demiştir?",
    options: ["Sakarya Savaşı", "Dumlupınar Savaşı", "Trablusgarp Savaşı", "Çanakkale Savaşı"],
    correctAnswer: "Çanakkale Savaşı",
    category: "Tarih",
    difficulty: "Zor",
    testNo: 4
  },
  // TARİH TEST-5
  {
    question: "Berlin Duvarı hangi yılda yıkılmıştır?",
    options: ["1980", "1985", "1989", "1991"],
    correctAnswer: "1989",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "'Yüzyıl Savaşları' hangi iki ülke arasında gerçekleşmiştir?",
    options: ["Almanya - Rusya", "İngiltere - Fransa", "Osmanlı - Bizans", "İtalya - Avusturya"],
    correctAnswer: "İngiltere - Fransa",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: "Osmanlı Devleti'nin ilk anayasası olan 'Kanun-i Esasi' hangi padişah zamanında ilan edilmiştir?",
    options: ["II. Mahmud", "II. Abdülhamit", "Abdülaziz", "V. Murat"],
    correctAnswer: "II. Abdülhamit",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: "İtalya'nın faşist lideri Benito Mussolini hangi unvanla anılmıştır?",
    options: ["Kaiser", "Duce", "Führer", "Consul"],
    correctAnswer: "Duce",
    category: "Tarih",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Mustafa Kemal Atatürk'ün katıldığı son savaş hangisidir?",
    options: ["Büyük Taarruz", "Sakarya Meydan Muharebesi", "II. İnönü Savaşı", "Kütahya-Eskişehir Savaşı"],
    correctAnswer: "Sakarya Meydan Muharebesi",
    category: "Tarih",
    difficulty: "Orta",
    testNo: 5
  },
  // BİLİM TEST-3
  {
    question: "Dünyanın etrafında döndüğü gök cismi hangisidir?",
    options: ["Ay", "Güneş", "Mars", "Venüs"],
    correctAnswer: "Güneş",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "Suyun kimyasal formülü nedir?",
    options: ["H₂", "O₂", "CO₂", "H₂O"],
    correctAnswer: "H₂O",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "Einstein'ın ünlü denklemi olan E=mc² formülündeki 'c' harfi neyi temsil eder?",
    options: ["Enerji", "Işık hızı", "Kütle", "Zaman"],
    correctAnswer: "Işık hızı",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "Hücre teorisini ortaya atan bilim insanlarından biri kimdir?",
    options: ["Charles Darwin", "Louis Pasteur", "Matthias Schleiden", "Isaac Newton"],
    correctAnswer: "Matthias Schleiden",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "İnsan vücudunda en fazla bulunan element hangisidir?",
    options: ["Oksijen", "Karbon", "Kalsiyum", "Azot"],
    correctAnswer: "Oksijen",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 3
  },
  // BİLİM TEST-4
  {
    question: "Bir cismin hareketini tanımlayan üç temel yasa hangi bilim insanına aittir?",
    options: ["Einstein", "Newton", "Kepler", "Galileo"],
    correctAnswer: "Newton",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "DNA'nın çift sarmal yapısını keşfeden bilim insanları kimlerdir?",
    options: ["Watson ve Crick", "Curie ve Rutherford", "Mendel ve Darwin", "Newton ve Pascal"],
    correctAnswer: "Watson ve Crick",
    category: "Bilim",
    difficulty: "Zor",
    testNo: 4
  },
  {
    question: "Ses boşlukta neden yayılmaz?",
    options: ["Hızı çok yavaş olduğu için", "Boşlukta madde olmadığı için", "Işık engellediği için", "Yerçekimi olmadığı için"],
    correctAnswer: "Boşlukta madde olmadığı için",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Maddenin plazma hali en çok nerede görülür?",
    options: ["Okyanus", "Atmosfer", "Güneş ve yıldızlar", "Kutup bölgeleri"],
    correctAnswer: "Güneş ve yıldızlar",
    category: "Bilim",
    difficulty: "Zor",
    testNo: 4
  },
  {
    question: "Aşağıdakilerden hangisi bir asit değildir?",
    options: ["HCl", "H₂SO₄", "NaOH", "CH₃COOH"],
    correctAnswer: "NaOH",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 4
  },
  // BİLİM TEST-5
  {
    question: "Bilimsel sınıflandırmada en küçük birim nedir?",
    options: ["Cins", "Tür", "Alemler", "Takım"],
    correctAnswer: "Tür",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Gözle görülemeyecek kadar küçük organizmalara ne ad verilir?",
    options: ["Parazit", "Mikrop", "Mikroskobik canlı", "Böcek"],
    correctAnswer: "Mikroskobik canlı",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Bir elektronun yükü nedir?",
    options: ["Pozitif", "Negatif", "Nötr", "Değişkendir"],
    correctAnswer: "Negatif",
    category: "Bilim",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Bitkilerde fotosentez süreci sırasında açığa çıkan gaz hangisidir?",
    options: ["Karbondioksit", "Azot", "Oksijen", "Hidrojen"],
    correctAnswer: "Oksijen",
    category: "Bilim",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: "İlk kadın Nobel Ödülü alan bilim insanı kimdir?",
    options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Dorothy Hodgkin"],
    correctAnswer: "Marie Curie",
    category: "Bilim",
    difficulty: "Zor",
    testNo: 5
  },
  // SPOR TEST-3
  {
    question: "FIFA Dünya Kupası'nı en çok kazanan ülke hangisidir?",
    options: ["Arjantin", "Brezilya", "Almanya", "İtalya"],
    correctAnswer: "Brezilya",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "NBA'de en fazla şampiyonluk kazanan takım hangisidir?",
    options: ["Chicago Bulls", "Golden State Warriors", "Los Angeles Lakers", "Boston Celtics"],
    correctAnswer: "Boston Celtics",
    category: "Spor",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "Teniste 'Grand Slam' turnuvalarından biri değildir:",
    options: ["Wimbledon", "Roland Garros", "US Open", "World Cup"],
    correctAnswer: "World Cup",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "Formula 1 tarihinde en çok dünya şampiyonu olan pilot kimdir?",
    options: ["Ayrton Senna", "Michael Schumacher", "Lewis Hamilton", "Sebastian Vettel"],
    correctAnswer: "Lewis Hamilton",
    category: "Spor",
    difficulty: "Zor",
    testNo: 3
  },
  {
    question: "Türkiye, ilk olimpiyat madalyasını hangi branşta kazanmıştır?",
    options: ["Güreş", "Halter", "Atletizm", "Boks"],
    correctAnswer: "Güreş",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 3
  },
  // SPOR TEST-4
  {
    question: "UEFA Şampiyonlar Ligi'ni en çok kazanan kulüp hangisidir?",
    options: ["Barcelona", "Bayern Münih", "AC Milan", "Real Madrid"],
    correctAnswer: "Real Madrid",
    category: "Spor",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Cristiano Ronaldo'nun ilk profesyonel kulübü hangisidir?",
    options: ["Sporting Lizbon", "Manchester United", "Real Madrid", "Porto"],
    correctAnswer: "Sporting Lizbon",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: "2020 Tokyo Olimpiyatları hangi yıl yapılmıştır (COVID-19 nedeniyle ertelenmiştir)?",
    options: ["2020", "2021", "2022", "2019"],
    correctAnswer: "2021",
    category: "Spor",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Milli kayakçı Aslı Nemutlu hangi spor dalında yer alıyordu?",
    options: ["Alp disiplini", "Snowboard", "Biatlon", "Artistik buz pateni"],
    correctAnswer: "Alp disiplini",
    category: "Spor",
    difficulty: "Zor",
    testNo: 4
  },
  {
    question: "Türkiye Süper Lig tarihinde en fazla şampiyon olan kulüp hangisidir?",
    options: ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"],
    correctAnswer: "Galatasaray",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 4
  },
  // SPOR TEST-5
  {
    question: "Voleybol topu ile oynanan bu spor dalında, her takımın sahada kaç oyuncusu olur?",
    options: ["5", "6", "7", "11"],
    correctAnswer: "6",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Bir maraton yarışında koşulan standart mesafe yaklaşık kaç kilometredir?",
    options: ["21 km", "32 km", "42 km", "50 km"],
    correctAnswer: "42 km",
    category: "Spor",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: "Messi, 2022 Dünya Kupası'nda hangi ülkenin kaptanıydı?",
    options: ["Brezilya", "Arjantin", "İspanya", "Uruguay"],
    correctAnswer: "Arjantin",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "'Smaç' terimi en çok hangi sporda kullanılır?",
    options: ["Futbol", "Tenis", "Voleybol", "Yüzme"],
    correctAnswer: "Voleybol",
    category: "Spor",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Michael Phelps, olimpiyat tarihinin en fazla madalya kazanan sporcusudur. Hangi branşta yarışmıştır?",
    options: ["Atletizm", "Yüzme", "Halter", "Güreş"],
    correctAnswer: "Yüzme",
    category: "Spor",
    difficulty: "Zor",
    testNo: 5
  },
  // TEKNOLOJİ TEST-3
  {
    question: "HTML, web sayfası tasarlamak için kullanılan ne tür bir dildir?",
    options: ["Programlama dili", "İşletim sistemi", "İşaretleme dili", "Komut dili"],
    correctAnswer: "İşaretleme dili",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "'Android' işletim sistemi hangi şirket tarafından geliştirilmiştir?",
    options: ["Apple", "Microsoft", "Samsung", "Google"],
    correctAnswer: "Google",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "Apple'ın kurucularından biri aşağıdakilerden hangisidir?",
    options: ["Elon Musk", "Steve Jobs", "Bill Gates", "Jeff Bezos"],
    correctAnswer: "Steve Jobs",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: "Bir bilgisayarın beyni olarak kabul edilen parça hangisidir?",
    options: ["RAM", "SSD", "GPU", "CPU"],
    correctAnswer: "CPU",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: "'Python' hangi alanda sıkça kullanılan bir programlama dilidir?",
    options: ["Müzik prodüksiyonu", "Web geliştirme", "Grafik tasarım", "Mimari çizim"],
    correctAnswer: "Web geliştirme",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 3
  },
  // TEKNOLOJİ TEST-4
  {
    question: "'RAM' bilgisayarda ne için kullanılır?",
    options: ["Kalıcı veri depolamak", "Geçici işlem verisi tutmak", "Ekran kartı hızını artırmak", "İnternet hızını belirlemek"],
    correctAnswer: "Geçici işlem verisi tutmak",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: "Aşağıdakilerden hangisi bir açık kaynak işletim sistemidir?",
    options: ["Windows", "Linux", "macOS", "iOS"],
    correctAnswer: "Linux",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: "Bir IP adresi aşağıdakilerden hangisine örnektir?",
    options: ["Yazılım lisansı", "Fiziksel donanım adresi", "Ağ üzerindeki cihaz tanımlayıcı", "Disk birimi"],
    correctAnswer: "Ağ üzerindeki cihaz tanımlayıcı",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: "İlk taşınabilir bilgisayarlar ne olarak adlandırılmıştır?",
    options: ["Laptop", "Ultrabook", "Notebook", "Luggable"],
    correctAnswer: "Luggable",
    category: "Teknoloji",
    difficulty: "Zor",
    testNo: 4
  },
  {
    question: "'Java' dili hangi cihazlar için de yaygın olarak kullanılır?",
    options: ["Mikrodalga fırınlar", "Cep telefonları", "DVD oynatıcılar", "Telsizler"],
    correctAnswer: "Cep telefonları",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 4
  },
  // TEKNOLOJİ TEST-5
  {
    question: "QR kodlar neyi temsil eder?",
    options: ["IP adreslerini", "3D grafik verisini", "Hızlı taranabilir veri bilgisini", "Donanım seri numarasını"],
    correctAnswer: "Hızlı taranabilir veri bilgisini",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "'SSD' ile 'HDD' arasındaki temel fark nedir?",
    options: ["Biri harici, diğeri dahili olması", "SSD'nin daha yavaş olması", "SSD'nin hareketli parça içermemesi", "HDD'nin daha pahalı olması"],
    correctAnswer: "SSD'nin hareketli parça içermemesi",
    category: "Teknoloji",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: "En yaygın kullanılan internet tarayıcısı hangisidir? (2020 sonrası)",
    options: ["Firefox", "Edge", "Opera", "Google Chrome"],
    correctAnswer: "Google Chrome",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "Aşağıdaki programlama dillerinden hangisi tarayıcı üzerinde çalışır?",
    options: ["Java", "Python", "JavaScript", "C++"],
    correctAnswer: "JavaScript",
    category: "Teknoloji",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: "'Siber güvenlik' hangi alanı kapsar?",
    options: ["Donanım üretimi", "Enerji verimliliği", "Bilgi sistemlerini tehditlerden koruma", "Grafik tasarım ve estetik"],
    correctAnswer: "Bilgi sistemlerini tehditlerden koruma",
    category: "Teknoloji",
    difficulty: "Zor",
    testNo: 5
  },
  // MÜZİK TEST-3
  {
    question: '\"Moonlight Sonata\" adlı eserin bestecisi kimdir?',
    options: ["Mozart", "Beethoven", "Chopin", "Bach"],
    correctAnswer: "Beethoven",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: 'Müzikte "do, re, mi, fa…" dizisine ne ad verilir?',
    options: ["Akor", "Gam", "Nota defteri", "Arpej"],
    correctAnswer: "Gam",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: 'Aşağıdaki müzik aletlerinden hangisi yaylı çalgılar ailesine aittir?',
    options: ["Flüt", "Viyola", "Saksafon", "Trompet"],
    correctAnswer: "Viyola",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 3
  },
  {
    question: 'Michael Jackson\'ın "Thriller" albümü hangi yılda çıkmıştır?',
    options: ["1980", "1982", "1985", "1987"],
    correctAnswer: "1982",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 3
  },
  {
    question: 'Türk sanat müziğinde kullanılan makam sistemine ne ad verilir?',
    options: ["Raga", "Makam", "Ton", "Mod"],
    correctAnswer: "Makam",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 3
  },
  // MÜZİK TEST-4
  {
    question: '\"Imagine\" adlı şarkısıyla tanınan eski Beatles üyesi kimdir?',
    options: ["Paul McCartney", "George Harrison", "Ringo Starr", "John Lennon"],
    correctAnswer: "John Lennon",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: 'Hangisi klasik Batı müziği bestecisidir?',
    options: ["Ludwig van Beethoven", "Bob Dylan", "Freddie Mercury", "Elvis Presley"],
    correctAnswer: "Ludwig van Beethoven",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: 'Müzikte "tempo" neyi ifade eder?',
    options: ["Ezginin tınısını", "Şarkının uzunluğunu", "Ritmin hızını", "Ses yüksekliğini"],
    correctAnswer: "Ritmin hızını",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 4
  },
  {
    question: 'Caz müziğin doğduğu yer olarak kabul edilen şehir hangisidir?',
    options: ["New York", "Chicago", "Los Angeles", "New Orleans"],
    correctAnswer: "New Orleans",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 4
  },
  {
    question: 'Barış Manço\'nun lakabı aşağıdakilerden hangisidir?',
    options: ["Anadolu Aslanı", "Barış Abi", "Rock Baba", "Manço King"],
    correctAnswer: "Barış Abi",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 4
  },
  // MÜZİK TEST-5
  {
    question: '\"Grammy Ödülleri\" hangi alanda verilmektedir?',
    options: ["Sinema", "Spor", "Müzik", "Moda"],
    correctAnswer: "Müzik",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: 'Bağlama hangi müzik kültürüne aittir?',
    options: ["Hint", "Japon", "Türk", "Çin"],
    correctAnswer: "Türk",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: 'Hangisi bir ses perdesi (nota) değildir?',
    options: ["La", "Do", "Si", "Te"],
    correctAnswer: "Te",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 5
  },
  {
    question: 'Pop müziğin "kraliçesi" olarak anılan sanatçı kimdir?',
    options: ["Madonna", "Lady Gaga", "Beyoncé", "Whitney Houston"],
    correctAnswer: "Madonna",
    category: "Müzik",
    difficulty: "Orta",
    testNo: 5
  },
  {
    question: 'Hangisi bir müzik türü değildir?',
    options: ["Jazz", "Hip hop", "Rock", "Pixel"],
    correctAnswer: "Pixel",
    category: "Müzik",
    difficulty: "Kolay",
    testNo: 5
  }
];

mongoose.connect('mongodb://127.0.0.1:27017/sohbet-uygulamasi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  try {
    await Quiz.deleteMany({}); // Mevcut soruları temizle
    await Quiz.insertMany(quizzes); // Yeni soruları ekle
    console.log('Quiz soruları başarıyla eklendi!');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
  process.exit(1);
}); 