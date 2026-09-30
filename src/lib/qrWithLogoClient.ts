import QRCode from "qrcode";

/**
 * Generates a QR Code as a Data URL (PNG) with the ALARA logo in the center.
 * Executed in browser environments (Client Component) using HTML5 Canvas.
 * 
 * Uses errorCorrectionLevel: 'H' (up to 30% redundancy) to ensure
 * the QR code remains 100% scannable even with the logo in the center.
 */
export async function generateQrCodeWithLogoClient(
  text: string,
  logoSrc: string = "/logo.png",
  options?: {
    width?: number;
    margin?: number;
    logoRatio?: number;
  }
): Promise<string> {
  const width = options?.width || 360;
  const margin = options?.margin ?? 2;
  const logoRatio = options?.logoRatio || 0.24;

  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return await QRCode.toDataURL(text, {
        width,
        margin,
        errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = width;

    // Render the QR code on canvas with High Error Correction
    await QRCode.toCanvas(canvas, text, {
      width,
      margin,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
    });

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return canvas.toDataURL("image/png");
    }

    // Load the logo image
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Gagal memuat logo"));
      img.src = logoSrc;
    });

    // Calculate center badge dimensions
    const centerBoxSize = Math.round(width * logoRatio);
    const centerBoxPos = Math.round((width - centerBoxSize) / 2);
    const cornerRadius = Math.round(centerBoxSize * 0.18);

    ctx.save();

    // 1. Draw crisp white badge background with rounded corners
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#cbd5e1"; // slate-300 border
    ctx.lineWidth = Math.max(1, Math.round(width * 0.005));

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(centerBoxPos, centerBoxPos, centerBoxSize, centerBoxSize, cornerRadius);
    } else {
      ctx.rect(centerBoxPos, centerBoxPos, centerBoxSize, centerBoxSize);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Draw ALARA logo inside with padding
    const innerPad = Math.round(centerBoxSize * 0.1);
    const innerSize = centerBoxSize - innerPad * 2;
    const innerPos = centerBoxPos + innerPad;

    ctx.drawImage(img, innerPos, innerPos, innerSize, innerSize);
    ctx.restore();

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Gagal menambahkan logo ke QR Code client, fallback ke QR standar:", err);
    return QRCode.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }
}
