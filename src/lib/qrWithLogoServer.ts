import fs from "fs";
import path from "path";
import QRCode from "qrcode";

/**
 * Generates a QR Code as an SVG Data URL with the ALARA logo in the center.
 * Executed in Node.js server environments (Server Component / Route Handler).
 */
export async function generateQrCodeWithLogoServer(
  text: string,
  logoRelativePath: string = "public/logo.png"
): Promise<string> {
  try {
    const rawSvg = await QRCode.toString(text, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    const logoFullPath = path.join(process.cwd(), logoRelativePath);
    let logoDataUri = "";
    if (fs.existsSync(logoFullPath)) {
      const logoBuffer = fs.readFileSync(logoFullPath);
      logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }

    if (!logoDataUri) {
      const svgBase64 = Buffer.from(rawSvg).toString("base64");
      return `data:image/svg+xml;base64,${svgBase64}`;
    }

    const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (!viewBoxMatch) {
      const svgBase64 = Buffer.from(rawSvg).toString("base64");
      return `data:image/svg+xml;base64,${svgBase64}`;
    }

    const size = parseInt(viewBoxMatch[1], 10);
    const logoBoxSize = (size * 0.24).toFixed(2);
    const logoBoxPos = ((size - parseFloat(logoBoxSize)) / 2).toFixed(2);
    const innerPad = (parseFloat(logoBoxSize) * 0.1).toFixed(2);
    const innerSize = (parseFloat(logoBoxSize) - parseFloat(innerPad) * 2).toFixed(2);
    const innerPos = (parseFloat(logoBoxPos) + parseFloat(innerPad)).toFixed(2);
    const radius = (parseFloat(logoBoxSize) * 0.18).toFixed(2);

    const centerOverlay = `
      <rect x="${logoBoxPos}" y="${logoBoxPos}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${radius}" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.35" />
      <image href="${logoDataUri}" x="${innerPos}" y="${innerPos}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet" />
    </svg>`;

    const finalSvg = rawSvg.replace("</svg>", centerOverlay);
    const svgBase64 = Buffer.from(finalSvg).toString("base64");
    return `data:image/svg+xml;base64,${svgBase64}`;
  } catch (err) {
    console.error("Gagal menambahkan logo ke QR Code server, fallback ke QR standar:", err);
    return QRCode.toDataURL(text, {
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }
}
