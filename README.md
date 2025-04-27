# Market Hesabı Takip Uygulaması

Bu proje, arkadaş grupları veya ev arkadaşları arasındaki ortak harcamaları takip etmek ve hesapları denkleştirmek için basit bir web uygulamasıdır. Kimin ne kadar harcadığını, kimin kime borçlu olduğunu ve hesapların nasıl kapatılacağını kolayca görmenizi sağlar. Tüm veriler tarayıcınızın yerel depolamasında (`localStorage`) saklanır.

## Özellikler

- **Kişi Yönetimi:** Hesaba dahil olacak kişileri ekleme, düzenleme ve silme.
- **Ödeme Kaydı:** Kimin, ne kadar, ne zaman ve ne için ödeme yaptığını kaydetme.
- **Borç Takibi:** Her ödemede kimlerin hesaba dahil olduğunu ve kimlerin borcunu ödeyip ödemediğini işaretleme.
- **Otomatik Hesaplama:**
  - Her kişinin toplam harcamasını ve net bakiyesini (alacaklı/borçlu durumu) hesaplama.
  - Hesapları kapatmak için kimin kime ne kadar ödeme yapması gerektiğini minimum işlemle gösterme (Borç basitleştirme).
- **Veri Saklama:** Tüm kişi ve ödeme bilgileri tarayıcının `localStorage`'ında saklanır, böylece sayfayı kapatsanız bile veriler kaybolmaz.
- **Düzenleme ve Silme:** Kayıtlı ödemeleri düzenleme veya silme.
- **Tüm Verileri Temizleme:** İstenildiğinde tüm kayıtları silme.
- **Duyarlı Tasarım:** Farklı ekran boyutlarında (mobil, tablet, masaüstü) kullanılabilir arayüz.

## Kullanılan Teknolojiler

- HTML5
- CSS3
- JavaScript (ES6 Modülleri)
- Bootstrap 5 (CSS Framework)
- Font Awesome (İkonlar)

## Nasıl Kullanılır?

1.  Projeyi klonlayın veya dosyaları indirin.
2.  `index.html` dosyasını web tarayıcınızda açın.
3.  **Kişi Yönetimi** bölümünden hesaba dahil olacak kişileri ekleyin.
4.  **Yeni Ödeme / Düzenleme** bölümünden yapılan harcamaları kaydedin:
    - Ödeyen kişiyi seçin.
    - Tutarı, tarihi ve açıklamayı girin.
    - "Hesaba Dahil Olanlar" bölümünden bu harcamaya katılan kişileri işaretleyin (Ödeyen kişi otomatik olarak işaretli ve değiştirilemez).
    - "Ödeme Kaydet" butonuna tıklayın.
5.  **Ödeme Geçmişi** tablosundan kayıtlı harcamaları ve kişilerin borç durumlarını takip edin. Borcunu ödeyen kişilerin yanındaki kutucuğu işaretleyebilirsiniz.
6.  **Özet** bölümünden genel durumu, kişi bakiyelerini ve hesapları kapatmak için yapılması gereken ödeme adımlarını görün.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.
