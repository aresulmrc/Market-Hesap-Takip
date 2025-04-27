# Market Hesabı Takip Uygulaması

Bu proje, arkadaş grupları veya ev arkadaşları arasındaki ortak harcamaları takip etmek ve hesapları denkleştirmek için basit bir web uygulamasıdır. Kimin ne kadar harcadığını, kimin kime borçlu olduğunu ve hesapların nasıl kapatılacağını kolayca görmenizi sağlar. Tüm veriler tarayıcınızın yerel depolamasında (`localStorage`) saklanır.

## Özellikler

- **Kişi Yönetimi:** Hesaba dahil olacak kişileri ekleme, düzenleme ve silme.
- **Ödeme Kaydı:** Kimin, ne kadar, ne zaman ve ne için ödeme yaptığını kaydetme.
- **Borç Takibi:** Her ödemede kimlerin hesaba dahil olduğunu ve kimlerin borcunu ödeyip ödemediğini işaretleme.
- **Otomatik Hesaplama:**
  - Her kişinin toplam harcamasını ve net bakiyesini (alacaklı/borçlu durumu) hesaplama.
  - Hesapları kapatmak için kimin kime ne kadar ödeme yapması gerektiğini minimum işlemle gösterme (Borç basitleştirme).
- **Veri Saklama:** Tüm kişi ve ödeme bilgileri tarayıcının `localStorage`'ında saklanır, böylece sayfayı kapatsanız bile veriler kaybolmaz. **(Uyarı: Tarayıcı verilerini temizlemek tüm kayıtları siler!)**
- **Düzenleme ve Silme:** Kayıtlı ödemeleri düzenleme veya silme.
- **Tüm Verileri Temizleme:** İstenildiğinde tüm kayıtları silme.
- **Duyarlı Tasarım:** Farklı ekran boyutlarında (mobil, tablet, masaüstü) kullanılabilir arayüz.

## Kullanılan Teknolojiler

- HTML5
- CSS3
- JavaScript (ES6 Modülleri)
- Bootstrap 5 (CSS Framework - CDN üzerinden)
- Font Awesome (İkonlar - CDN üzerinden)

## Nasıl Kullanılır?

1.  Projeyi klonlayın veya dosyaları indirin.
2.  **Önemli:** Bu proje JavaScript Modülleri kullandığı için, `index.html` dosyasını doğrudan tarayıcıda açmak yerine bir yerel web sunucusu üzerinden çalıştırmanız gerekmektedir.
    - **VS Code Kullanıcıları İçin:** [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) eklentisini kurup, `index.html` dosyasına sağ tıklayıp "Open with Live Server" seçeneğini kullanabilirsiniz.
    - **Python Yüklü İse:** Terminal veya komut istemcisini proje klasöründe açıp `python -m http.server` komutunu çalıştırın ve tarayıcınızda `http://localhost:8000` adresine gidin.
    - **Node.js Yüklü İse:** Terminalde `npm install -g http-server` komutuyla `http-server` paketini kurduktan sonra, proje klasöründe `http-server` komutunu çalıştırıp belirtilen adrese (genellikle `http://localhost:8080`) gidin.
3.  **Not:** Uygulamanın arayüzü (Bootstrap ve Font Awesome) CDN üzerinden yüklenmektedir. Bu nedenle, stillerin ve ikonların doğru görüntülenmesi için (ilk yüklemede veya tarayıcı önbelleği temizlendiğinde) **internet bağlantısı gereklidir**.
4.  Tarayıcıda açılan uygulama üzerinden **Kişi Yönetimi** bölümünden hesaba dahil olacak kişileri ekleyin.
5.  **Yeni Ödeme / Düzenleme** bölümünden yapılan harcamaları kaydedin:
    - Ödeyen kişiyi seçin.
    - Tutarı, tarihi ve açıklamayı girin.
    - "Hesaba Dahil Olanlar" bölümünden bu harcamaya katılan kişileri işaretleyin (Ödeyen kişi otomatik olarak işaretli ve değiştirilemez).
    - "Ödeme Kaydet" butonuna tıklayın.
6.  **Ödeme Geçmişi** tablosundan kayıtlı harcamaları ve kişilerin borç durumlarını takip edin. Borcunu ödeyen kişilerin yanındaki kutucuğu işaretleyebilirsiniz.
7.  **Özet** bölümünden genel durumu, kişi bakiyelerini ve hesapları kapatmak için yapılması gereken ödeme adımlarını görün.
8.  **Dikkat:** Tarayıcı verilerini (geçmiş, çerezler, site verileri vb.) temizlemek, bu uygulamada saklanan tüm kişi ve ödeme kayıtlarını **kalıcı olarak silecektir!** Verilerinizi yedeklemenin bir yolu şu an için bulunmamaktadır.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.
