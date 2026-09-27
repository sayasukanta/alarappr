export interface FooterSettingsData {
  phone: string;
  email: string;
  address: string;
  mapUrl?: string | null;
  brandTitle: string;
  brandSubtitle: string;
  brandDescription: string;
  institutionName: string;
  ktunNumber: string;
  bankName: string;
  bankAccountName: string;
  copyrightText: string;
  footerKtunText: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettingsData = {
  phone: "+62 812-3456-7890",
  email: "info@hikmatproteksi.com",
  address: "Indonesia",
  mapUrl: "https://maps.google.com/?q=Jakarta",
  brandTitle: "ALARA Training System",
  brandSubtitle: "CV. Hikmat Proteksi ALARA",
  brandDescription:
    "Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN, berkomitmen menghasilkan tenaga PPR profesional dan kompeten.",
  institutionName: "CV. Hikmat Proteksi ALARA",
  ktunNumber: "No. 07998.722.1.040726",
  bankName: "Mandiri No. 166-00-0733926-0",
  bankAccountName: "CV Hikmat Proteksi ALARA",
  copyrightText: "CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi.",
  footerKtunText: "KTUN BAPETEN No. 07998.722.1.040726",
};
