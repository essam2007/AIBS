export type Lang = 'en' | 'ar'

export const t: Record<string, { en: string; ar: string }> = {
  // Navigation
  home:           { en: 'Home',          ar: 'الرئيسية' },
  listings:       { en: 'Listings',      ar: 'القوائم' },
  deals:          { en: 'My Deals',      ar: 'صفقاتي' },
  brokers:        { en: 'Brokers',       ar: 'الوسطاء' },
  documents:      { en: 'Documents',     ar: 'المستندات' },
  profile:        { en: 'Profile',       ar: 'الملف الشخصي' },
  admin:          { en: 'Admin',         ar: 'الإدارة' },
  dashboard:      { en: 'Dashboard',     ar: 'لوحة التحكم' },
  login:          { en: 'Sign In',       ar: 'تسجيل الدخول' },
  register:       { en: 'Register',      ar: 'إنشاء حساب' },
  logout:         { en: 'Sign Out',      ar: 'تسجيل الخروج' },

  // Landing
  tagline:        { en: 'The Gulf\'s #1 Oil Trading Platform', ar: 'منصة التداول النفطي الأولى في الخليج' },
  subtitle:       { en: 'Buy, sell and broker crude oil and refined products across the GCC with verified counterparties, live specs, and AI-powered deal matching.', ar: 'اشترِ وبِع وتوسط في النفط الخام والمنتجات المكررة عبر دول الخليج مع أطراف مُتحقق منها ومواصفات حية ومطابقة صفقات بالذكاء الاصطناعي.' },
  getStarted:     { en: 'Get Started Free', ar: 'ابدأ مجاناً' },
  viewListings:   { en: 'Browse Listings', ar: 'تصفح القوائم' },

  // Listings
  newListing:     { en: 'Post Listing',  ar: 'نشر قائمة' },
  buy:            { en: 'Buy',           ar: 'شراء' },
  sell:           { en: 'Sell',          ar: 'بيع' },
  allTypes:       { en: 'All Types',     ar: 'جميع الأنواع' },
  allOrigins:     { en: 'All Origins',   ar: 'جميع المصادر' },
  sortNewest:     { en: 'Newest First',  ar: 'الأحدث أولاً' },
  quantity:       { en: 'Quantity',      ar: 'الكمية' },
  incoterms:      { en: 'Incoterms',     ar: 'الإنكوترمز' },
  delivery:       { en: 'Delivery',      ar: 'التسليم' },
  origin:         { en: 'Origin',        ar: 'المصدر' },
  apiGravity:     { en: 'API Gravity',   ar: 'الكثافة API' },
  sulfurContent:  { en: 'Sulfur %',      ar: 'نسبة الكبريت %' },
  sendInquiry:    { en: 'Send Inquiry',  ar: 'إرسال استفسار' },
  viewDeal:       { en: 'View Deal',     ar: 'عرض الصفقة' },
  grade:          { en: 'Grade',         ar: 'الدرجة' },
  price:          { en: 'Price',         ar: 'السعر' },
  negotiable:     { en: 'Negotiable',    ar: 'قابل للتفاوض' },
  verified:       { en: 'Verified',      ar: 'موثق' },
  active:         { en: 'Active',        ar: 'نشط' },
  expired:        { en: 'Expired',       ar: 'منتهي' },
  closed:         { en: 'Closed',        ar: 'مغلق' },

  // Specs
  specifications: { en: 'Chemical Specifications', ar: 'المواصفات الكيميائية' },
  sweet:          { en: 'Sweet',         ar: 'حلو' },
  sour:           { en: 'Sour',          ar: 'حامض' },
  light:          { en: 'Light',         ar: 'خفيف' },
  heavy:          { en: 'Heavy',         ar: 'ثقيل' },

  // Deals
  dealRoom:       { en: 'Deal Room',     ar: 'غرفة الصفقة' },
  sendMessage:    { en: 'Send Message',  ar: 'إرسال رسالة' },
  updateStatus:   { en: 'Update Status', ar: 'تحديث الحالة' },
  noDeals:        { en: 'No deals yet',  ar: 'لا توجد صفقات بعد' },

  // Common
  loading:        { en: 'Loading...',    ar: 'جاري التحميل...' },
  save:           { en: 'Save',          ar: 'حفظ' },
  cancel:         { en: 'Cancel',        ar: 'إلغاء' },
  submit:         { en: 'Submit',        ar: 'إرسال' },
  search:         { en: 'Search',        ar: 'بحث' },
  filter:         { en: 'Filter',        ar: 'تصفية' },
  edit:           { en: 'Edit',          ar: 'تعديل' },
  delete:         { en: 'Delete',        ar: 'حذف' },
  view:           { en: 'View',          ar: 'عرض' },
  back:           { en: 'Back',          ar: 'رجوع' },
  next:           { en: 'Next',          ar: 'التالي' },
  upload:         { en: 'Upload',        ar: 'رفع' },
  download:       { en: 'Download',      ar: 'تحميل' },
  optional:       { en: 'Optional',      ar: 'اختياري' },
  required:       { en: 'Required',      ar: 'مطلوب' },
  yes:            { en: 'Yes',           ar: 'نعم' },
  no:             { en: 'No',            ar: 'لا' },
  name:           { en: 'Name',          ar: 'الاسم' },
  email:          { en: 'Email',         ar: 'البريد الإلكتروني' },
  phone:          { en: 'Phone',         ar: 'الهاتف' },
  company:        { en: 'Company',       ar: 'الشركة' },
  country:        { en: 'Country',       ar: 'الدولة' },
  role:           { en: 'Role',          ar: 'الدور' },
  broker:         { en: 'Broker',        ar: 'وسيط' },
  buyer:          { en: 'Buyer',         ar: 'مشتري' },
  seller:         { en: 'Seller',        ar: 'بائع' },
  rating:         { en: 'Rating',        ar: 'التقييم' },
  dealsClosedLabel: { en: 'Deals Closed', ar: 'صفقات مغلقة' },
  memberSince:    { en: 'Member Since',  ar: 'عضو منذ' },
  totalVolume:    { en: 'Total Volume',  ar: 'إجمالي الحجم' },
}

export function translate(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? t[key]?.en ?? key
}
