import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.cart': 'Cart',
    'nav.login': 'Partner Login',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.partner_portal': 'KINSA Global - Your Partner Portal',
    'dashboard.browse_products': 'Browse More Products',
    'dashboard.active_orders': 'Active Orders',
    'dashboard.total_orders': 'Total Orders',
    'dashboard.total_volume': 'Total Volume',
    'dashboard.order_management': 'Order Management',
    'dashboard.browse_products_tab': 'Browse Products',
    'dashboard.order_history': 'Order History',
    'dashboard.contact_support': 'Contact Support',
    'dashboard.featured_products': 'Featured Products',
    'dashboard.current_cart': 'Current Inquiry Cart',
    'dashboard.proceed_checkout': 'Proceed to Checkout',
    
    // Language selector
    'language.select': 'Select Language',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Order status
    'order.status.pending': 'Pending',
    'order.status.processing': 'Processing',
    'order.status.in_transit': 'In Transit',
    'order.status.delivered': 'Delivered',
    'order.status.cancelled': 'Cancelled',
    
    // Table headers
    'table.order_id': 'Order ID',
    'table.date': 'Date',
    'table.items': 'Items',
    'table.total_value': 'Total Value',
    'table.status': 'Status',
    'table.actions': 'Actions',
    
    // Common
    'common.loading': 'Loading...',
    'common.retry': 'Retry',
    'common.remove': 'Remove',
    'common.total': 'Total',
    'common.cancel': 'Cancel',
    'common.view': 'View',
    'common.details': 'Details',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.catalog': 'कैटलॉग',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.cart': 'कार्ट',
    'nav.login': 'पार्टनर लॉगिन',
    'nav.logout': 'लॉगआउट',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.partner_portal': 'KINSA Global - आपका पार्टनर पोर्टल',
    'dashboard.browse_products': 'अधिक उत्पाद देखें',
    'dashboard.active_orders': 'सक्रिय ऑर्डर',
    'dashboard.total_orders': 'कुल ऑर्डर',
    'dashboard.total_volume': 'कुल मात्रा',
    'dashboard.order_management': 'ऑर्डर प्रबंधन',
    'dashboard.browse_products_tab': 'उत्पाद देखें',
    'dashboard.order_history': 'ऑर्डर इतिहास',
    'dashboard.contact_support': 'सहायता संपर्क',
    'dashboard.featured_products': 'विशेष उत्पाद',
    'dashboard.current_cart': 'वर्तमान पूछताछ कार्ट',
    'dashboard.proceed_checkout': 'चेकआउट पर जाएं',
    
    // Language selector
    'language.select': 'भाषा चुनें',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Order status
    'order.status.pending': 'लंबित',
    'order.status.processing': 'प्रसंस्करण',
    'order.status.in_transit': 'ट्रांजिट में',
    'order.status.delivered': 'डिलीवर किया गया',
    'order.status.cancelled': 'रद्द',
    
    // Table headers
    'table.order_id': 'ऑर्डर ID',
    'table.date': 'दिनांक',
    'table.items': 'आइटम',
    'table.total_value': 'कुल मूल्य',
    'table.status': 'स्थिति',
    'table.actions': 'कार्य',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.retry': 'पुनः प्रयास',
    'common.remove': 'हटाएं',
    'common.total': 'कुल',
    'common.cancel': 'रद्द करें',
    'common.view': 'देखें',
    'common.details': 'विवरण',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.catalog': 'Catálogo',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.dashboard': 'Panel',
    'nav.cart': 'Carrito',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido',
    'dashboard.partner_portal': 'KINSA Global - Su Portal de Socios',
    'dashboard.browse_products': 'Ver Más Productos',
    'dashboard.active_orders': 'Pedidos Activos',
    'dashboard.total_orders': 'Pedidos Totales',
    'dashboard.total_volume': 'Volumen Total',
    'dashboard.order_management': 'Gestión de Pedidos',
    'dashboard.browse_products_tab': 'Ver Productos',
    'dashboard.order_history': 'Historial de Pedidos',
    'dashboard.contact_support': 'Contactar Soporte',
    'dashboard.featured_products': 'Productos Destacados',
    'dashboard.current_cart': 'Carrito de Consulta Actual',
    'dashboard.proceed_checkout': 'Proceder al Pago',
    
    // Language selector
    'language.select': 'Seleccionar Idioma',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Common
    'common.loading': 'Cargando...',
    'common.retry': 'Reintentar',
    'common.remove': 'Eliminar',
    'common.total': 'Total',
    'common.cancel': 'Cancelar',
    'common.view': 'Ver',
    'common.details': 'Detalles',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.catalog': 'Catalogue',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Tableau de Bord',
    'nav.cart': 'Panier',
    'nav.login': 'Connexion Partenaire',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.partner_portal': 'KINSA Global - Votre Portail Partenaire',
    'dashboard.browse_products': 'Voir Plus de Produits',
    'dashboard.active_orders': 'Commandes Actives',
    'dashboard.total_orders': 'Commandes Totales',
    'dashboard.total_volume': 'Volume Total',
    'dashboard.order_management': 'Gestion des Commandes',
    'dashboard.browse_products_tab': 'Parcourir les Produits',
    'dashboard.order_history': 'Historique des Commandes',
    'dashboard.contact_support': 'Contacter le Support',
    'dashboard.featured_products': 'Produits en Vedette',
    'dashboard.current_cart': 'Panier de Demande Actuel',
    'dashboard.proceed_checkout': 'Procéder au Paiement',
    
    // Language selector
    'language.select': 'Sélectionner la Langue',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Common
    'common.loading': 'Chargement...',
    'common.retry': 'Réessayer',
    'common.remove': 'Supprimer',
    'common.total': 'Total',
    'common.cancel': 'Annuler',
    'common.view': 'Voir',
    'common.details': 'Détails',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.catalog': 'Katalog',
    'nav.about': 'Über Uns',
    'nav.contact': 'Kontakt',
    'nav.dashboard': 'Dashboard',
    'nav.cart': 'Warenkorb',
    'nav.login': 'Partner Login',
    'nav.logout': 'Abmelden',
    
    // Dashboard
    'dashboard.welcome': 'Willkommen',
    'dashboard.partner_portal': 'KINSA Global - Ihr Partner Portal',
    'dashboard.browse_products': 'Mehr Produkte Durchsuchen',
    'dashboard.active_orders': 'Aktive Bestellungen',
    'dashboard.total_orders': 'Gesamtbestellungen',
    'dashboard.total_volume': 'Gesamtvolumen',
    'dashboard.order_management': 'Bestellverwaltung',
    'dashboard.browse_products_tab': 'Produkte Durchsuchen',
    'dashboard.order_history': 'Bestellhistorie',
    'dashboard.contact_support': 'Support Kontaktieren',
    'dashboard.featured_products': 'Empfohlene Produkte',
    'dashboard.current_cart': 'Aktueller Anfrage-Warenkorb',
    'dashboard.proceed_checkout': 'Zur Kasse Gehen',
    
    // Language selector
    'language.select': 'Sprache Auswählen',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Common
    'common.loading': 'Laden...',
    'common.retry': 'Wiederholen',
    'common.remove': 'Entfernen',
    'common.total': 'Gesamt',
    'common.cancel': 'Abbrechen',
    'common.view': 'Ansehen',
    'common.details': 'Details',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.catalog': '产品目录',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',
    'nav.dashboard': '仪表板',
    'nav.cart': '购物车',
    'nav.login': '合作伙伴登录',
    'nav.logout': '退出登录',
    
    // Dashboard
    'dashboard.welcome': '欢迎',
    'dashboard.partner_portal': 'KINSA Global - 您的合作伙伴门户',
    'dashboard.browse_products': '浏览更多产品',
    'dashboard.active_orders': '活跃订单',
    'dashboard.total_orders': '总订单数',
    'dashboard.total_volume': '总量',
    'dashboard.order_management': '订单管理',
    'dashboard.browse_products_tab': '浏览产品',
    'dashboard.order_history': '订单历史',
    'dashboard.contact_support': '联系支持',
    'dashboard.featured_products': '精选产品',
    'dashboard.current_cart': '当前询价购物车',
    'dashboard.proceed_checkout': '进行结账',
    
    // Language selector
    'language.select': '选择语言',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Common
    'common.loading': '加载中...',
    'common.retry': '重试',
    'common.remove': '移除',
    'common.total': '总计',
    'common.cancel': '取消',
    'common.view': '查看',
    'common.details': '详情',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.catalog': 'الكتالوج',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.dashboard': 'لوحة التحكم',
    'nav.cart': 'السلة',
    'nav.login': 'تسجيل دخول الشريك',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً',
    'dashboard.partner_portal': 'KINSA Global - بوابة الشريك الخاصة بك',
    'dashboard.browse_products': 'تصفح المزيد من المنتجات',
    'dashboard.active_orders': 'الطلبات النشطة',
    'dashboard.total_orders': 'إجمالي الطلبات',
    'dashboard.total_volume': 'الحجم الإجمالي',
    'dashboard.order_management': 'إدارة الطلبات',
    'dashboard.browse_products_tab': 'تصفح المنتجات',
    'dashboard.order_history': 'تاريخ الطلبات',
    'dashboard.contact_support': 'اتصل بالدعم',
    'dashboard.featured_products': 'المنتجات المميزة',
    'dashboard.current_cart': 'سلة الاستفسار الحالية',
    'dashboard.proceed_checkout': 'المتابعة للدفع',
    
    // Language selector
    'language.select': 'اختر اللغة',
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.arabic': 'العربية',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.retry': 'إعادة المحاولة',
    'common.remove': 'إزالة',
    'common.total': 'المجموع',
    'common.cancel': 'إلغاء',
    'common.view': 'عرض',
    'common.details': 'التفاصيل',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('kinsa-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kinsa-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}