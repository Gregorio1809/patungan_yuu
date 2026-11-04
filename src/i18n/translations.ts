export type Language = 'id' | 'en'
export type Params = Record<string, string | number>
export type TranslationValue =
  | string
  | ((params: Params) => string)

const id = {
  'common.cancel': 'Batal',
  'common.close': 'Tutup',
  'common.save': 'Simpan',
  'common.saving': 'Menyimpan...',
  'common.processing': 'Memproses...',
  'common.delete': 'Hapus',
  'common.done': 'Selesai',
  'common.add': 'Tambah',
  'common.adding': 'Menambah...',
  'common.backHome': 'Ke beranda',
  'common.retry': 'Coba lagi',
  'common.copyLink': 'Salin link',
  'common.copied': 'Link tersalin',
  'common.you': 'Kamu',
  'common.payer': 'Penerima',
  'common.quantity': 'jumlah',
  'common.weight': 'bobot',
  'common.decrease': 'Kurangi {label}',
  'common.increase': 'Tambah {label}',
  'common.itemCount': ({ count }: Params) => `${count} item`,
  'common.personCount': ({ count }: Params) => `${count} orang`,
  'common.percent': 'Persen',
  'common.amount': 'Nominal',

  'preferences.switchToEnglish': 'Ganti ke bahasa Inggris',
  'preferences.switchToIndonesian': 'Ganti ke bahasa Indonesia',
  'preferences.lightMode': 'Aktifkan mode terang',
  'preferences.darkMode': 'Aktifkan mode gelap',

  'app.tagline': 'Bagi bill tanpa drama',
  'app.homeAria': 'Patungan Yuu, kembali ke beranda',
  'app.backHome': 'Kembali ke beranda',

  'mode.local': 'Mode lokal',
  'mode.supabase': 'Supabase',
  'mode.synced': 'Tersinkron',
  'mode.connecting': 'Menyambung',

  'header.copyLink': 'Salin link',
  'header.showQr': 'Tampilkan QR',
  'header.settings': 'Atur bill dan pembayaran',
  'header.backHome': 'Kembali ke beranda',

  'home.setupTitle': 'Supabase belum tersambung',
  'home.setupBody':
    'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local atau Netlify, lalu deploy ulang. Skema database ada di supabase/schema.sql.',
  'home.badge': 'Split bill rame-rame',
  'home.heroLine1': 'Bagi bill,',
  'home.heroLine2': 'bukan bingung.',
  'home.heroBody':
    'Buat sesi, bagikan link, biarkan setiap orang klaim itemnya sendiri. Total tiap orang dihitung otomatis, lengkap dengan ongkir, diskon, service, dan pajak.',
  'home.ctaPrimary': 'Mulai patungan',
  'home.ctaSecondary': 'Lihat cara kerja',
  'home.trustFree': 'Gratis',
  'home.trustNoAccount': 'Tanpa akun',
  'home.trustShare': 'Siap dibagikan',
  'home.localNote': 'Mode lokal — data tersimpan di browser ini.',
  'home.stepCreateTitle': 'Buat sesi',
  'home.stepCreateBody': 'Cukup beri nama acara.',
  'home.stepShareTitle': 'Bagikan link',
  'home.stepShareBody': 'Peserta buka link dan isi nama.',
  'home.stepClaimTitle': 'Atur & klaim',
  'home.stepClaimBody': 'Atur biaya, lalu klaim item.',
  'home.howTitle': 'Cara kerjanya',
  'home.howSubtitle': 'Tiga langkah, bill langsung beres.',
  'home.featuresTitle': 'Semua yang kamu butuhkan',
  'home.featuresSubtitle':
    'Dari klaim item sampai transfer, semuanya rapi di satu tempat.',
  'home.featureClaimTitle': 'Klaim per item',
  'home.featureClaimBody':
    'Setiap orang pilih itemnya sendiri, tanpa perlu tanya-tanya.',
  'home.featureCostsTitle': 'Diskon, ongkir, pajak',
  'home.featureCostsBody':
    'Dihitung otomatis dan dibagi proporsional.',
  'home.featureQrTitle': 'Bagikan lewat QR',
  'home.featureQrBody':
    'Peserta langsung gabung dari HP masing-masing.',
  'home.featurePaidTitle': 'Tandai lunas',
  'home.featurePaidBody':
    'Lihat siapa yang sudah transfer dan berapa.',
  'home.goodForTitle': 'Cocok buat',
  'home.usecasesSubtitle':
    'Makan bareng, patungan hadiah, sampai bill kafe.',
  'home.goodFor1': 'Makan rame-rame di kantor',
  'home.goodFor2': 'Patungan kado atau tiket',
  'home.goodFor3': 'Bill kafe yang pajaknya bikin bingung',
  'home.startEyebrow': 'Mulai sekarang',
  'home.startHeadline': 'Siap bagi bill?',
  'home.startBody':
    'Buat sesi, bagikan link, dan biarkan semua orang mengisi bagiannya sendiri.',
  'home.startPoint1': 'Tanpa akun, tanpa instal aplikasi',
  'home.startPoint2': 'Bisa dibuka dari HP atau laptop',
  'home.startPoint3': 'Total dihitung otomatis',
  'home.recentTitle': 'Sesi terakhir',
  'home.recentSubtitle':
    'Lanjutkan patungan yang sudah kamu buat.',
  'home.previewTitle': 'Makan malam kantor',
  'home.previewMeta': '3 peserta · 5 item',
  'home.previewMore': '+{count} peserta lainnya',
  'home.previewTotal': 'Total bill',
  'home.previewAllPaid': 'Semua sudah lunas',
  'home.previewNote': 'Tanpa chat bolak-balik.',
  'home.footerNote': 'Dibuat untuk makan bareng yang seru.',
  'home.createError':
    'Gagal membuat sesi. Cek koneksi lalu coba lagi.',

  'create.name': 'Nama sesi',
  'create.placeholder': 'Contoh: Makan malam kantor',
  'create.hint':
    'Diskon, service, pajak, dan tip bisa diatur setelah sesi dibuat.',
  'create.required': 'Nama sesi wajib diisi.',
  'create.disabled': 'Supabase belum tersambung',
  'create.pending': 'Membuat sesi...',
  'create.submit': 'Buat sesi',
  'create.localHint': 'Mode lokal: link hanya bisa dibuka di browser ini.',
  'create.remoteHint': 'Semua orang yang punya link bisa ikut mengisi.',

  'join.title': 'Gabung ke patungan',
  'join.description':
    'Isi namamu supaya bisa klaim item dan lihat totalmu.',
  'join.name': 'Nama kamu',
  'join.placeholder': 'Contoh: Budi',
  'join.required': 'Nama wajib diisi.',
  'join.viewOnly': 'Lihat dulu',
  'join.pending': 'Menggabungkan...',
  'join.as': 'Gabung sebagai {name}',
  'join.submit': 'Gabung',
  'join.matched':
    'Nama {name} sudah terdaftar. Tombol gabung akan memakai nama itu, misalnya saat membuka link di perangkat kedua.',
  'join.noAccount':
    'Tanpa akun. Identitasmu disimpan di perangkat ini.',

  'session.loadErrorTitle': 'Gagal memuat sesi',
  'session.loadErrorBody':
    'Periksa koneksi atau konfigurasi Supabase, lalu coba lagi.',
  'session.notFoundTitle': 'Sesi tidak ditemukan',
  'session.notFoundBody':
    'Link mungkin salah atau sesinya sudah dihapus. Periksa lagi link dari pembuat sesi.',
  'session.newSession': 'Buat sesi baru',
  'session.localBanner':
    'Mode lokal. Data tersimpan di browser ini, jadi link hanya bisa dibuka di browser yang sama.',
  'session.remoteBanner':
    'Semua orang yang punya link bisa mengubah data. Salin link lewat tombol di kanan atas, lalu bagikan ke peserta.',
  'session.removed':
    'Kamu sudah keluar dari sesi ini. Gabung lagi untuk mengedit.',
  'session.joinFirst': 'Gabung dulu untuk mengubah patungan ini.',

  'participants.title': 'Peserta',
  'participants.subtitle':
    'Setiap orang bisa klaim item dari perangkat masing-masing.',
  'participants.empty':
    'Belum ada peserta. Tambahkan nama untuk mulai membagi bill.',
  'participants.payerSubtitle': 'Menalangi bill',
  'participants.role': 'Peserta',
  'participants.addPlaceholder':
    'Tambah nama peserta, misal: Budi',
  'participants.newAria': 'Nama peserta baru',
  'participants.add': 'Tambah',
  'participants.adding': 'Menambah...',
  'participants.editAria': 'Edit {name}',

  'items.title': 'Item',
  'items.add': 'Tambah item',
  'items.emptyTitle': 'Belum ada item',
  'items.emptyBody':
    'Tambahkan item beserta harganya, lalu peserta bisa mengklaim.',
  'items.emptyCta': 'Tambah item pertama',
  'items.discountBadge': 'Diskon {value}',
  'items.unclaimed': 'Belum diklaim',
  'items.noClaims': 'Belum ada yang klaim item ini',
  'items.claim': 'Klaim',
  'items.duplicateAria': 'Duplikat item',
  'items.editAria': 'Edit item',
  'items.deleteAria': 'Hapus item',

  'itemDialog.addTitle': 'Tambah item',
  'itemDialog.editTitle': 'Edit item',
  'itemDialog.description': 'Harga, jumlah, diskon, dan peserta item.',
  'itemDialog.name': 'Nama item',
  'itemDialog.namePlaceholder': 'Contoh: Nasi goreng seafood',
  'itemDialog.price': 'Harga satuan',
  'itemDialog.quantity': 'Jumlah',
  'itemDialog.discount': 'Diskon item',
  'itemDialog.discountTypeAria': 'Tipe diskon item',
  'itemDialog.percentAria': 'Diskon persen',
  'itemDialog.amountAria': 'Diskon nominal',
  'itemDialog.gross': 'Harga sebelum diskon',
  'itemDialog.discountLine': 'Diskon',
  'itemDialog.net': 'Harga bersih',
  'itemDialog.nameRequired': 'Nama item wajib diisi.',
  'itemDialog.percentMax': 'Diskon persen maksimal 100%.',
  'itemDialog.participants': 'Siapa yang ikut?',
  'itemDialog.newParticipantPlaceholder': 'Nama peserta baru',
  'itemDialog.newParticipantAria': 'Nama peserta baru',
  'itemDialog.newBadge': 'Baru',
  'itemDialog.removeNewAria': 'Batalkan {name}',
  'itemDialog.save': 'Simpan item',
  'itemDialog.saving': 'Menyimpan...',

  'claim.title': 'Klaim item',
  'claim.info':
    'Centang peserta yang ikut menikmati item ini. Bobot 1 berarti satu porsi, dan total item dibagi sesuai bobot semua pengklaim.',
  'claim.net': 'Nilai bersih {amount}',
  'claim.weight': '· {count} bobot klaim',
  'claim.done': 'Selesai',

  'participantDialog.title': 'Edit peserta',
  'participantDialog.description':
    'Ganti nama tanpa menghilangkan klaim item.',
  'participantDialog.remove': 'Hapus peserta',
  'participantDialog.save': 'Simpan nama',
  'participantDialog.saving': 'Menyimpan...',
  'participantDialog.name': 'Nama peserta',
  'participantDialog.claimsKept':
    'Klaim item tetap tersimpan saat nama diubah.',
  'participantDialog.required': 'Nama peserta wajib diisi.',

  'bill.title': 'Pengaturan bill',
  'bill.description':
    'Diskon, ongkir, service, pajak, tip, dan pembulatan.',
  'bill.save': 'Simpan pengaturan',
  'bill.saving': 'Menyimpan...',
  'bill.discountSection': 'Diskon bill',
  'bill.percent': 'Persen',
  'bill.amount': 'Nominal',
  'bill.discountTypeAria': 'Tipe diskon bill',
  'bill.discountValue': 'Nilai diskon',
  'bill.discountValueAria': 'Diskon bill nominal',
  'bill.discountScope': 'Dasar diskon',
  'bill.scopeItems': 'Per item (ongkir tidak ikut diskon)',
  'bill.scopeFinal': 'Total akhir (ongkir ikut diskon)',
  'bill.scopeHelp':
    'Total akhir = subtotal item + ongkir. Service dan pajak dihitung setelah diskon.',
  'bill.allocation': 'Cara bagi diskon',
  'bill.allocationProportional': 'Proporsional sesuai subtotal',
  'bill.allocationEqual': 'Dibagi rata',
  'bill.extraSection': 'Biaya tambahan',
  'bill.shipping': 'Ongkir',
  'bill.shippingAria': 'Ongkir',
  'bill.shippingHelp': 'Dibagi rata ke peserta yang punya item.',
  'bill.service': 'Service charge',
  'bill.tax': 'Pajak / PB1',
  'bill.taxBase': 'Dasar pajak',
  'bill.taxAfter': 'Setelah diskon (umum)',
  'bill.taxBefore': 'Sebelum diskon',
  'bill.tip': 'Tip',
  'bill.paymentSection': 'Pembayaran',
  'bill.rounding': 'Pembulatan transfer',
  'bill.roundingNone': 'Tanpa pembulatan',
  'bill.rounding500': 'Bulatkan ke Rp500',
  'bill.rounding1000': 'Bulatkan ke Rp1.000',
  'bill.receipt': 'Total struk',
  'bill.receiptAria': 'Total struk',
  'bill.receiptHelp': 'Dipakai untuk mengecek selisih di ringkasan.',
  'bill.sessionName': 'Nama sesi',
  'bill.subtotal': 'Subtotal',
  'bill.discountLine': 'Diskon bill',
  'bill.serviceLine': 'Service',
  'bill.taxLine': 'Pajak / PB1',
  'bill.tipLine': 'Tip',
  'bill.totalAfter': 'Total setelah biaya',
  'bill.previewEmpty':
    'Tambahkan dan klaim item dulu untuk melihat preview perhitungan.',
  'bill.errorName': 'Nama sesi wajib diisi.',
  'bill.errorDiscountMax': 'Diskon bill maksimal 100%.',
  'bill.errorPercentMax': 'Service dan pajak maksimal 100%.',

  'summary.title': 'Ringkasan',
  'summary.subtitle': 'Total yang harus dibayar tiap orang.',
  'summary.share': 'Bagikan',
  'summary.unclaimedTitle': ({ count }: Params) =>
    `${count} item belum diklaim`,
  'summary.unclaimedBody':
    '{names} ({amount}) tidak dibebankan ke siapa pun.',
  'summary.unclaimedMore': '+{count} lainnya',
  'summary.splitAll': 'Bagi rata semua',
  'summary.chargePayer': 'Bebankan ke {name}',
  'summary.itemSubtotal': 'Subtotal item',
  'summary.itemDiscount': 'Diskon item',
  'summary.shipping': 'Ongkir',
  'summary.billDiscount': 'Diskon bill',
  'summary.service': 'Service',
  'summary.tax': 'Pajak / PB1',
  'summary.tip': 'Tip',
  'summary.total': 'Total',
  'summary.receiptTitle': 'Cek total struk',
  'summary.receiptTotal': 'Total struk',
  'summary.appTotal': 'Total aplikasi',
  'summary.receiptMatch': 'Cocok dengan total struk.',
  'summary.receiptHigher':
    'Total aplikasi {amount} lebih tinggi dari struk.',
  'summary.receiptLower':
    'Total aplikasi {amount} lebih rendah dari struk.',
  'summary.settings': 'Atur bill & pembayaran',
  'summary.weight': 'bobot {weight}',
  'summary.noItems': 'Tidak ikut item mana pun.',
  'summary.noParticipants': 'Belum ada peserta.',

  'settlement.title': 'Pembayaran',
  'settlement.subtitle':
    'Tentukan penerima transfer dan tandai yang sudah lunas.',
  'settlement.paidCount': '{paid}/{total} lunas',
  'settlement.payerLabel': 'Yang menalangi bill',
  'settlement.payerNone': 'Belum ditentukan',
  'settlement.payerHelp':
    'Pilih penerima transfer untuk melihat arah pembayaran.',
  'settlement.ownShare': 'Bagian sendiri',
  'settlement.unpaid': 'Belum dibayar',
  'settlement.rounding':
    'Pembulatan ke atas ke {amount}. Kelebihan {extra} untuk penerima.',
  'settlement.transferTo': 'Transfer ke {name}',
  'settlement.totalBill': 'Total tagihan',
  'settlement.from': 'dari {amount}',
  'settlement.markUnpaidAria': 'Batalkan lunas {name}',
  'settlement.markPaidAria': 'Tandai lunas {name}',
  'settlement.paid': 'Lunas',
  'settlement.update': 'Perbarui',
  'settlement.mark': 'Tandai',
  'settlement.empty': 'Belum ada tagihan untuk dibayar.',

  'sticky.total': 'Total kamu',
  'sticky.notJoined': 'Belum gabung',
  'sticky.joinPrompt': 'Gabung untuk lihat totalmu',
  'sticky.unclaimed': ({ count }: Params) =>
    `${count} item belum diklaim`,
  'sticky.details': 'Lihat rincian',
  'sticky.join': 'Gabung',

  'qr.title': 'Bagikan via QR',
  'qr.description':
    'Minta peserta memindai kode ini dengan kamera HP.',
  'qr.error':
    'Gagal membuat QR code. Link tetap bisa disalin.',
  'qr.alt': 'QR code untuk link patungan',
  'qr.note':
    'QR mengarah ke link sesi ini. Peserta bisa memindai untuk langsung bergabung.',

  'toast.close': 'Tutup notifikasi',
  'modal.close': 'Tutup',
  'stepper.decrease': 'Kurangi {label}',
  'stepper.increase': 'Tambah {label}',
  'stepper.weight': 'bobot',

  'share.subtotal': 'Subtotal',
  'share.itemDiscount': 'Diskon item',
  'share.shipping': 'Ongkir',
  'share.billDiscount': 'Diskon bill',
  'share.service': 'Service',
  'share.tax': 'Pajak/PB1',
  'share.tip': 'Tip',
  'share.total': 'Total',
  'share.payerSuffix': ' (penerima)',
  'share.transferTo': '💳 Transfer ke {name}:',
  'share.paid': 'lunas',
  'share.stale': 'perlu dicek',
  'share.unpaid': 'belum lunas',
  'share.rounding': '  Pembulatan: +{amount} untuk {name}',
  'share.unclaimed':
    'Catatan: {count} item belum diklaim ({amount}): {names}',

  'toast.joinedExisting': 'Kamu bergabung sebagai {name}.',
  'toast.joinedNew': 'Halo, {name}. Kamu sudah bergabung.',
  'toast.joinError': 'Gagal bergabung. Coba lagi.',
  'toast.participantAdded': '{name} ditambahkan.',
  'toast.participantAddError':
    'Gagal menambah peserta. Coba lagi.',
  'toast.participantRenamed': 'Nama peserta diperbarui.',
  'toast.participantRenameError':
    'Gagal mengganti nama peserta. Coba lagi.',
  'toast.participantRemoved': '{name} dihapus dari sesi.',
  'toast.removeError': 'Gagal menghapus. Coba lagi.',
  'toast.itemUpdated': 'Item diperbarui.',
  'toast.itemAdded': 'Item ditambahkan.',
  'toast.itemSaveError': 'Gagal menyimpan item. Coba lagi.',
  'toast.itemDuplicated': 'Item diduplikat.',
  'toast.itemDuplicateError':
    'Gagal menduplikat item. Coba lagi.',
  'toast.itemDeleted': 'Item dihapus.',
  'toast.claimError': 'Gagal menyimpan klaim. Coba lagi.',
  'toast.settingsSaved': 'Pengaturan sesi disimpan.',
  'toast.settingsError':
    'Gagal menyimpan pengaturan. Coba lagi.',
  'toast.payerSaved': 'Penerima transfer disimpan.',
  'toast.payerCleared': 'Penerima transfer dikosongkan.',
  'toast.payerError':
    'Gagal menyimpan penerima transfer. Coba lagi.',
  'toast.paid': 'Ditandai lunas.',
  'toast.unpaid': 'Status lunas dibatalkan.',
  'toast.paidError':
    'Gagal memperbarui status pembayaran. Coba lagi.',
  'toast.unclaimedAssigned': ({ count }: Params) =>
    `${count} item dibebankan.`,
  'toast.unclaimedError':
    'Gagal membebankan item. Coba lagi.',
  'toast.copyLink': 'Link disalin. Bagikan ke peserta lain.',
  'toast.copyLinkError':
    'Gagal menyalin link. Salin dari address bar saja.',
  'toast.summaryCopied': 'Ringkasan disalin ke clipboard.',
  'toast.summaryError':
    'Gagal membagikan ringkasan. Coba lagi.',
  'toast.pickPayer': 'Pilih penerima transfer dulu.',

  'confirm.removeParticipantTitle': 'Hapus peserta?',
  'confirm.removeParticipantBody':
    '“{name}” akan dihapus beserta semua klaim itemnya.',
  'confirm.removeParticipantAction': 'Hapus peserta',
  'confirm.removeItemTitle': 'Hapus item?',
  'confirm.removeItemBody':
    '“{name}” akan dihapus dari daftar item.',
  'confirm.removeItemAction': 'Hapus item',
  'confirm.note': 'Tindakan ini tidak bisa dibatalkan.',

  'notFound.title': 'Halaman tidak ditemukan',
  'notFound.body':
    'Link yang kamu buka tidak dikenal. Periksa lagi alamatnya atau mulai sesi baru.',
  'notFound.cta': 'Kembali ke beranda',
} as const satisfies Record<string, TranslationValue>

export type TranslationKey = keyof typeof id

const en: Record<TranslationKey, TranslationValue> = {
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.processing': 'Processing...',
  'common.delete': 'Delete',
  'common.done': 'Done',
  'common.add': 'Add',
  'common.adding': 'Adding...',
  'common.backHome': 'Back to home',
  'common.retry': 'Try again',
  'common.copyLink': 'Copy link',
  'common.copied': 'Link copied',
  'common.you': 'You',
  'common.payer': 'Payer',
  'common.quantity': 'quantity',
  'common.weight': 'weight',
  'common.decrease': 'Decrease {label}',
  'common.increase': 'Increase {label}',
  'common.itemCount': ({ count }: Params) =>
    `${count} ${Number(count) === 1 ? 'item' : 'items'}`,
  'common.personCount': ({ count }: Params) =>
    `${count} ${Number(count) === 1 ? 'person' : 'people'}`,
  'common.percent': 'Percent',
  'common.amount': 'Amount',

  'preferences.switchToEnglish': 'Switch to English',
  'preferences.switchToIndonesian': 'Switch to Indonesian',
  'preferences.lightMode': 'Switch to light mode',
  'preferences.darkMode': 'Switch to dark mode',

  'app.tagline': 'Split bills without drama',
  'app.homeAria': 'Patungan Yuu, back to home',
  'app.backHome': 'Back to home',

  'mode.local': 'Local mode',
  'mode.supabase': 'Supabase',
  'mode.synced': 'Synced',
  'mode.connecting': 'Connecting',

  'header.copyLink': 'Copy link',
  'header.showQr': 'Show QR',
  'header.settings': 'Bill and payment settings',
  'header.backHome': 'Back to home',

  'home.setupTitle': 'Supabase is not connected',
  'home.setupBody':
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or Netlify, then redeploy. The database schema is in supabase/schema.sql.',
  'home.badge': 'Split bills together',
  'home.heroLine1': 'Split bills,',
  'home.heroLine2': 'without the drama.',
  'home.heroBody':
    'Create a session, share the link, and let everyone claim their own items. Each person’s total is calculated automatically, including shipping, discounts, service, and tax.',
  'home.ctaPrimary': 'Start a split',
  'home.ctaSecondary': 'See how it works',
  'home.trustFree': 'Free',
  'home.trustNoAccount': 'No account',
  'home.trustShare': 'Ready to share',
  'home.localNote': 'Local mode — data stays in this browser.',
  'home.stepCreateTitle': 'Create a session',
  'home.stepCreateBody': 'Just name the event.',
  'home.stepShareTitle': 'Share the link',
  'home.stepShareBody': 'Everyone opens the link and enters their name.',
  'home.stepClaimTitle': 'Set up & claim',
  'home.stepClaimBody': 'Set the costs, then claim items.',
  'home.howTitle': 'How it works',
  'home.howSubtitle': 'Three steps, bill sorted.',
  'home.featuresTitle': 'Everything you need',
  'home.featuresSubtitle':
    'From claiming items to transferring, it is all in one place.',
  'home.featureClaimTitle': 'Claim per item',
  'home.featureClaimBody':
    'Everyone picks their own items, no questions needed.',
  'home.featureCostsTitle': 'Discounts, shipping, tax',
  'home.featureCostsBody':
    'Calculated automatically and split proportionally.',
  'home.featureQrTitle': 'Share with a QR code',
  'home.featureQrBody':
    'Everyone joins from their own phone.',
  'home.featurePaidTitle': 'Track payments',
  'home.featurePaidBody':
    'See who has paid and how much.',
  'home.goodForTitle': 'Great for',
  'home.usecasesSubtitle':
    'Team meals, group gifts, and cafe bills.',
  'home.goodFor1': 'Team lunches at the office',
  'home.goodFor2': 'Splitting gifts or tickets',
  'home.goodFor3': 'Cafe bills with confusing tax',
  'home.startEyebrow': 'Start now',
  'home.startHeadline': 'Ready to split?',
  'home.startBody':
    'Create a session, share the link, and let everyone fill in their part.',
  'home.startPoint1': 'No account, no app install',
  'home.startPoint2': 'Works on phone or laptop',
  'home.startPoint3': 'Totals calculated automatically',
  'home.recentTitle': 'Recent sessions',
  'home.recentSubtitle': 'Pick up a split you already started.',
  'home.previewTitle': 'Team dinner',
  'home.previewMeta': '3 people · 5 items',
  'home.previewMore': ({ count }: Params) =>
    `+${count} ${Number(count) === 1 ? 'more person' : 'more people'}`,
  'home.previewTotal': 'Bill total',
  'home.previewAllPaid': 'Everyone has paid',
  'home.previewNote': 'No back-and-forth chat.',
  'home.footerNote': 'Made for good meals together.',
  'home.createError':
    'Could not create the session. Check your connection and try again.',

  'create.name': 'Session name',
  'create.placeholder': 'e.g. Team dinner',
  'create.hint':
    'Discounts, service, tax, and tip can be set after the session is created.',
  'create.required': 'Session name is required.',
  'create.disabled': 'Supabase is not connected',
  'create.pending': 'Creating session...',
  'create.submit': 'Create session',
  'create.localHint':
    'Local mode: this link only works in this browser.',
  'create.remoteHint':
    'Anyone with the link can join and fill it in.',

  'join.title': 'Join the split',
  'join.description':
    'Enter your name to claim items and see your total.',
  'join.name': 'Your name',
  'join.placeholder': 'e.g. Alex',
  'join.required': 'Name is required.',
  'join.viewOnly': 'Just looking',
  'join.pending': 'Joining...',
  'join.as': 'Join as {name}',
  'join.submit': 'Join',
  'join.matched':
    'The name {name} is already registered. The join button will use that name, for example when opening the link on a second device.',
  'join.noAccount':
    'No account needed. Your identity is stored on this device.',

  'session.loadErrorTitle': 'Could not load the session',
  'session.loadErrorBody':
    'Check your connection or Supabase configuration, then try again.',
  'session.notFoundTitle': 'Session not found',
  'session.notFoundBody':
    'The link may be wrong or the session was deleted. Double-check the link from the session owner.',
  'session.newSession': 'Create a new session',
  'session.localBanner':
    'Local mode. Data is stored in this browser, so the link only works in the same browser.',
  'session.remoteBanner':
    'Anyone with the link can edit the data. Copy the link from the top-right button and share it with everyone.',
  'session.removed':
    'You are no longer in this session. Join again to edit.',
  'session.joinFirst': 'Join first to edit this split.',

  'participants.title': 'Participants',
  'participants.subtitle':
    'Everyone can claim items from their own device.',
  'participants.empty':
    'No participants yet. Add a name to start splitting the bill.',
  'participants.payerSubtitle': 'Paid the bill',
  'participants.role': 'Participant',
  'participants.addPlaceholder':
    'Add a participant, e.g. Alex',
  'participants.newAria': 'New participant name',
  'participants.add': 'Add',
  'participants.adding': 'Adding...',
  'participants.editAria': 'Edit {name}',

  'items.title': 'Items',
  'items.add': 'Add item',
  'items.emptyTitle': 'No items yet',
  'items.emptyBody':
    'Add items with their prices, then everyone can claim.',
  'items.emptyCta': 'Add the first item',
  'items.discountBadge': 'Discount {value}',
  'items.unclaimed': 'Unclaimed',
  'items.noClaims': 'No one has claimed this item',
  'items.claim': 'Claim',
  'items.duplicateAria': 'Duplicate item',
  'items.editAria': 'Edit item',
  'items.deleteAria': 'Delete item',

  'itemDialog.addTitle': 'Add item',
  'itemDialog.editTitle': 'Edit item',
  'itemDialog.description':
    'Item price, quantity, discount, and participants.',
  'itemDialog.name': 'Item name',
  'itemDialog.namePlaceholder': 'e.g. Seafood fried rice',
  'itemDialog.price': 'Unit price',
  'itemDialog.quantity': 'Quantity',
  'itemDialog.discount': 'Item discount',
  'itemDialog.discountTypeAria': 'Item discount type',
  'itemDialog.percentAria': 'Discount percent',
  'itemDialog.amountAria': 'Discount amount',
  'itemDialog.gross': 'Price before discount',
  'itemDialog.discountLine': 'Discount',
  'itemDialog.net': 'Net price',
  'itemDialog.nameRequired': 'Item name is required.',
  'itemDialog.percentMax':
    'Percentage discount cannot exceed 100%.',
  'itemDialog.participants': 'Who is sharing this?',
  'itemDialog.newParticipantPlaceholder': 'New participant name',
  'itemDialog.newParticipantAria': 'New participant name',
  'itemDialog.newBadge': 'New',
  'itemDialog.removeNewAria': 'Remove {name}',
  'itemDialog.save': 'Save item',
  'itemDialog.saving': 'Saving...',

  'claim.title': 'Claim item',
  'claim.info':
    'Check everyone who shared this item. A weight of 1 means one portion, and the item total is split by the total weight of all claimers.',
  'claim.net': 'Net {amount}',
  'claim.weight': '· claim weight: {count}',
  'claim.done': 'Done',

  'participantDialog.title': 'Edit participant',
  'participantDialog.description':
    'Rename without losing item claims.',
  'participantDialog.remove': 'Remove participant',
  'participantDialog.save': 'Save name',
  'participantDialog.saving': 'Saving...',
  'participantDialog.name': 'Participant name',
  'participantDialog.claimsKept':
    'Item claims stay intact when the name changes.',
  'participantDialog.required': 'Participant name is required.',

  'bill.title': 'Bill settings',
  'bill.description':
    'Discounts, shipping, service, tax, tip, and rounding.',
  'bill.save': 'Save settings',
  'bill.saving': 'Saving...',
  'bill.discountSection': 'Bill discount',
  'bill.percent': 'Percent',
  'bill.amount': 'Amount',
  'bill.discountTypeAria': 'Bill discount type',
  'bill.discountValue': 'Discount value',
  'bill.discountValueAria': 'Bill discount amount',
  'bill.discountScope': 'Discount base',
  'bill.scopeItems': 'Items only (shipping is not discounted)',
  'bill.scopeFinal': 'Final total (shipping is discounted)',
  'bill.scopeHelp':
    'Final total = item subtotal + shipping. Service and tax are calculated after the discount.',
  'bill.allocation': 'Discount allocation',
  'bill.allocationProportional': 'Proportional to subtotal',
  'bill.allocationEqual': 'Split evenly',
  'bill.extraSection': 'Additional costs',
  'bill.shipping': 'Shipping',
  'bill.shippingAria': 'Shipping',
  'bill.shippingHelp':
    'Split evenly among participants who have items.',
  'bill.service': 'Service charge',
  'bill.tax': 'Tax / PB1',
  'bill.taxBase': 'Tax base',
  'bill.taxAfter': 'After discount (common)',
  'bill.taxBefore': 'Before discount',
  'bill.tip': 'Tip',
  'bill.paymentSection': 'Payment',
  'bill.rounding': 'Transfer rounding',
  'bill.roundingNone': 'No rounding',
  'bill.rounding500': 'Round up to Rp500',
  'bill.rounding1000': 'Round up to Rp1,000',
  'bill.receipt': 'Receipt total',
  'bill.receiptAria': 'Receipt total',
  'bill.receiptHelp': 'Used to check the difference in the summary.',
  'bill.sessionName': 'Session name',
  'bill.subtotal': 'Subtotal',
  'bill.discountLine': 'Bill discount',
  'bill.serviceLine': 'Service',
  'bill.taxLine': 'Tax / PB1',
  'bill.tipLine': 'Tip',
  'bill.totalAfter': 'Total after costs',
  'bill.previewEmpty':
    'Add and claim items first to see the calculation preview.',
  'bill.errorName': 'Session name is required.',
  'bill.errorDiscountMax': 'Bill discount cannot exceed 100%.',
  'bill.errorPercentMax': 'Service and tax cannot exceed 100%.',

  'summary.title': 'Summary',
  'summary.subtitle': 'What each person needs to pay.',
  'summary.share': 'Share',
  'summary.unclaimedTitle': ({ count }: Params) =>
    `${count} ${Number(count) === 1 ? 'unclaimed item' : 'unclaimed items'}`,
  'summary.unclaimedBody':
    '{names} ({amount}) — not charged to anyone.',
  'summary.unclaimedMore': '+{count} more',
  'summary.splitAll': 'Split all evenly',
  'summary.chargePayer': 'Charge {name}',
  'summary.itemSubtotal': 'Item subtotal',
  'summary.itemDiscount': 'Item discount',
  'summary.shipping': 'Shipping',
  'summary.billDiscount': 'Bill discount',
  'summary.service': 'Service',
  'summary.tax': 'Tax / PB1',
  'summary.tip': 'Tip',
  'summary.total': 'Total',
  'summary.receiptTitle': 'Receipt check',
  'summary.receiptTotal': 'Receipt total',
  'summary.appTotal': 'App total',
  'summary.receiptMatch': 'Matches the receipt total.',
  'summary.receiptHigher':
    'The app total is {amount} higher than the receipt.',
  'summary.receiptLower':
    'The app total is {amount} lower than the receipt.',
  'summary.settings': 'Bill & payment settings',
  'summary.weight': 'weight {weight}',
  'summary.noItems': 'Not included in any items.',
  'summary.noParticipants': 'No participants yet.',

  'settlement.title': 'Payments',
  'settlement.subtitle':
    'Choose who received the money and mark who has paid.',
  'settlement.paidCount': '{paid}/{total} paid',
  'settlement.payerLabel': 'Who paid the bill',
  'settlement.payerNone': 'Not selected',
  'settlement.payerHelp':
    'Choose who received the transfer to see the payment directions.',
  'settlement.ownShare': 'Own share',
  'settlement.unpaid': 'Unpaid',
  'settlement.rounding':
    'Rounded up to {amount}. The extra {extra} goes to the payer.',
  'settlement.transferTo': 'Transfer to {name}',
  'settlement.totalBill': 'Total due',
  'settlement.from': 'from {amount}',
  'settlement.markUnpaidAria': 'Mark {name} as unpaid',
  'settlement.markPaidAria': 'Mark {name} as paid',
  'settlement.paid': 'Paid',
  'settlement.update': 'Update',
  'settlement.mark': 'Mark paid',
  'settlement.empty': 'No payments due yet.',

  'sticky.total': 'Your total',
  'sticky.notJoined': 'Not joined',
  'sticky.joinPrompt': 'Join to see your total',
  'sticky.unclaimed': ({ count }: Params) =>
    `${count} ${Number(count) === 1 ? 'unclaimed item' : 'unclaimed items'}`,
  'sticky.details': 'View details',
  'sticky.join': 'Join',

  'qr.title': 'Share via QR',
  'qr.description':
    'Ask everyone to scan this code with their phone camera.',
  'qr.error': 'Could not create the QR code. You can still copy the link.',
  'qr.alt': 'QR code for the split link',
  'qr.note':
    'The QR points to this session’s link. Everyone can scan it to join.',

  'toast.close': 'Close notification',
  'modal.close': 'Close',
  'stepper.decrease': 'Decrease {label}',
  'stepper.increase': 'Increase {label}',
  'stepper.weight': 'weight',

  'share.subtotal': 'Subtotal',
  'share.itemDiscount': 'Item discount',
  'share.shipping': 'Shipping',
  'share.billDiscount': 'Bill discount',
  'share.service': 'Service',
  'share.tax': 'Tax/PB1',
  'share.tip': 'Tip',
  'share.total': 'Total',
  'share.payerSuffix': ' (payer)',
  'share.transferTo': '💳 Transfer to {name}:',
  'share.paid': 'paid',
  'share.stale': 'needs checking',
  'share.unpaid': 'unpaid',
  'share.rounding': '  Rounding: +{amount} for {name}',
  'share.unclaimed': ({ count, amount, names }: Params) =>
    `Note: ${count} ${Number(count) === 1 ? 'unclaimed item' : 'unclaimed items'} (${amount}): ${names}`,

  'toast.joinedExisting': 'You joined as {name}.',
  'toast.joinedNew': 'Hi, {name}. You are in.',
  'toast.joinError': 'Could not join. Try again.',
  'toast.participantAdded': '{name} added.',
  'toast.participantAddError':
    'Could not add the participant. Try again.',
  'toast.participantRenamed': 'Participant name updated.',
  'toast.participantRenameError':
    'Could not rename the participant. Try again.',
  'toast.participantRemoved': '{name} was removed from the session.',
  'toast.removeError': 'Could not delete. Try again.',
  'toast.itemUpdated': 'Item updated.',
  'toast.itemAdded': 'Item added.',
  'toast.itemSaveError': 'Could not save the item. Try again.',
  'toast.itemDuplicated': 'Item duplicated.',
  'toast.itemDuplicateError':
    'Could not duplicate the item. Try again.',
  'toast.itemDeleted': 'Item deleted.',
  'toast.claimError': 'Could not save the claim. Try again.',
  'toast.settingsSaved': 'Session settings saved.',
  'toast.settingsError':
    'Could not save the settings. Try again.',
  'toast.payerSaved': 'Payer saved.',
  'toast.payerCleared': 'Payer cleared.',
  'toast.payerError':
    'Could not save the payer. Try again.',
  'toast.paid': 'Marked as paid.',
  'toast.unpaid': 'Payment status cleared.',
  'toast.paidError':
    'Could not update the payment status. Try again.',
  'toast.unclaimedAssigned': ({ count }: Params) =>
    `${count} ${Number(count) === 1 ? 'item' : 'items'} assigned.`,
  'toast.unclaimedError':
    'Could not assign the items. Try again.',
  'toast.copyLink': 'Link copied. Share it with everyone.',
  'toast.copyLinkError':
    'Could not copy the link. Copy it from the address bar instead.',
  'toast.summaryCopied': 'Summary copied to the clipboard.',
  'toast.summaryError':
    'Could not share the summary. Try again.',
  'toast.pickPayer': 'Choose a payer first.',

  'confirm.removeParticipantTitle': 'Remove participant?',
  'confirm.removeParticipantBody':
    '“{name}” will be removed along with all their item claims.',
  'confirm.removeParticipantAction': 'Remove participant',
  'confirm.removeItemTitle': 'Delete item?',
  'confirm.removeItemBody':
    '“{name}” will be removed from the item list.',
  'confirm.removeItemAction': 'Delete item',
  'confirm.note': 'This action cannot be undone.',

  'notFound.title': 'Page not found',
  'notFound.body':
    'That link is not recognized. Check the address or start a new session.',
  'notFound.cta': 'Back to home',
}

export const translations: Record<
  Language,
  Record<TranslationKey, TranslationValue>
> = { id, en }

export function translate(
  language: Language,
  key: TranslationKey,
  params: Params = {},
): string {
  const value = translations[language][key] ?? translations.id[key]
  if (typeof value === 'function') return value(params)
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? `{${name}}`),
  )
}
