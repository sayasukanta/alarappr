import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALARA_LOGO_BASE64 } from "@/lib/logo-base64";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const batchId = parseInt(resolved.id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID Batch tidak valid" }, { status: 400 });
    }

    const batch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        training: true,
        selectedTryoutQuestions: {
          include: { question: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    let questionsToPrint: any[] = [];

    // Jika mode manual dan ada butir soal terpilih
    if (
      batch.tryoutSelectionMode === "MANUAL" &&
      batch.selectedTryoutQuestions &&
      batch.selectedTryoutQuestions.length > 0
    ) {
      questionsToPrint = batch.selectedTryoutQuestions.map((sq) => sq.question);
    } else {
      // Jika mode otomatis: ambil bank soal aktif sesuai kuota
      const count = batch.tryoutQuestionCount || 20;
      questionsToPrint = await prisma.question.findMany({
        where: {
          category: batch.training.category,
          isActive: true,
        },
        orderBy: { id: "asc" },
        take: count,
      });
    }

    if (questionsToPrint.length === 0) {
      return new NextResponse(
        "<html><body style='font-family: sans-serif; padding: 40px; text-align: center;'><h2>Belum ada soal yang tersedia untuk batch ini.</h2><p>Silakan isi bank soal atau tentukan pilihan soal di menu admin.</p></body></html>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const totalQuestions = questionsToPrint.length;
    const duration = batch.tryoutDurationMinutes || (totalQuestions <= 20 ? 30 : totalQuestions <= 50 ? 60 : 90);
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate HTML butir soal
    const questionsHtml = questionsToPrint
      .map((q, idx) => {
        const num = idx + 1;
        return `
        <div class="question-item">
          <div class="q-header">
            <span class="q-num">${num}.</span>
            <div class="q-content">
              <div class="q-topic-badge">${q.topic}</div>
              <div class="q-text">${q.questionText}</div>
              ${
                q.imageUrl
                  ? `<div class="q-image"><img src="${q.imageUrl}" alt="Ilustrasi Soal ${num}" /></div>`
                  : ""
              }
              <div class="q-options">
                <div class="opt-row"><span class="opt-key">A.</span> <span class="opt-val">${q.optionA}</span></div>
                <div class="opt-row"><span class="opt-key">B.</span> <span class="opt-val">${q.optionB}</span></div>
                <div class="opt-row"><span class="opt-key">C.</span> <span class="opt-val">${q.optionC}</span></div>
                <div class="opt-row"><span class="opt-key">D.</span> <span class="opt-val">${q.optionD}</span></div>
                ${
                  q.optionE
                    ? `<div class="opt-row"><span class="opt-key">E.</span> <span class="opt-val">${q.optionE}</span></div>`
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Generate Lembar Jawaban Manual (LJK Grid)
    const ljkRowsHtml = Array.from({ length: totalQuestions }, (_, i) => {
      const num = i + 1;
      return `
        <div class="ljk-item">
          <span class="ljk-num">${num}.</span>
          <span class="ljk-bubble">[ A ]</span>
          <span class="ljk-bubble">[ B ]</span>
          <span class="ljk-bubble">[ C ]</span>
          <span class="ljk-bubble">[ D ]</span>
          <span class="ljk-bubble">[ E ]</span>
        </div>
      `;
    }).join("");

    // Generate Kunci Jawaban & Pembahasan untuk Pengawas
    const answerKeyRowsHtml = questionsToPrint
      .map(
        (q, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold; width: 40px;">${idx + 1}</td>
          <td style="width: 130px; font-size: 11px; color: #475569;">${q.topic}</td>
          <td style="text-align: center; font-weight: bold; width: 50px; background: #f0fdf4; color: #166534; font-size: 14px;">${q.correctAnswer}</td>
          <td style="font-size: 11px; color: #334155; line-height: 1.4;">${q.explanation || "-"}</td>
        </tr>
      `
      )
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Naskah Soal Tryout BAPETEN - ${batch.training.title} (Batch ${batch.batchNumber})</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif, system-ui;
              font-size: 12pt;
              line-height: 1.45;
              color: #111827;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .no-print-bar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #1e293b;
              color: white;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              z-index: 9999;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              font-family: system-ui, sans-serif;
            }
            .no-print-bar button {
              background: #007AFF;
              color: white;
              border: none;
              padding: 8px 18px;
              font-size: 13px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              transition: background 0.15s;
            }
            .no-print-bar button:hover {
              background: #1d4ed8;
            }
            .content-wrapper {
              margin-top: 60px;
              padding: 10px 0;
            }
            @media print {
              .no-print-bar {
                display: none !important;
              }
              .content-wrapper {
                margin-top: 0 !important;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }

            /* Kop Surat */
            .header-kop {
              display: flex;
              align-items: center;
              gap: 16px;
              border-bottom: 3px double #000;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .header-kop img {
              width: 70px;
              height: 70px;
              object-fit: contain;
            }
            .header-kop-text {
              flex: 1;
              text-align: center;
            }
            .header-kop-text h2 {
              margin: 0;
              font-size: 15pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-kop-text h3 {
              margin: 2px 0;
              font-size: 12pt;
              font-weight: 600;
              color: #1e3a8a;
            }
            .header-kop-text p {
              margin: 0;
              font-size: 9pt;
              color: #4b5563;
              font-family: system-ui, sans-serif;
            }

            /* Box Metadata Ujian */
            .exam-meta-box {
              border: 1px solid #000;
              padding: 10px 14px;
              margin-bottom: 14px;
              font-size: 10pt;
              font-family: system-ui, sans-serif;
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 8px;
              background: #fafafa;
            }
            .meta-item {
              display: flex;
            }
            .meta-label {
              width: 140px;
              font-weight: 600;
            }
            .meta-val {
              flex: 1;
            }

            /* Kotak Identitas Peserta */
            .participant-identity-box {
              border: 1px dashed #64748b;
              padding: 10px 14px;
              margin-bottom: 16px;
              font-family: system-ui, sans-serif;
              font-size: 10pt;
              background: #fff;
            }
            .p-field {
              margin-bottom: 6px;
              display: flex;
            }
            .p-label {
              width: 130px;
              font-weight: 600;
            }
            .p-dots {
              flex: 1;
              border-bottom: 1px dotted #94a3b8;
              height: 16px;
            }

            /* Petunjuk Ujian */
            .instructions {
              border-left: 3px solid #007AFF;
              background: #f8fafc;
              padding: 8px 12px;
              margin-bottom: 20px;
              font-family: system-ui, sans-serif;
              font-size: 9pt;
              color: #334155;
            }
            .instructions ol {
              margin: 4px 0 0 16px;
              padding: 0;
            }

            /* Butir Soal */
            .question-item {
              margin-bottom: 18px;
              page-break-inside: avoid;
            }
            .q-header {
              display: flex;
              align-items: flex-start;
              gap: 8px;
            }
            .q-num {
              font-weight: bold;
              width: 24px;
              text-align: right;
              shrink: 0;
            }
            .q-content {
              flex: 1;
            }
            .q-topic-badge {
              display: inline-block;
              font-family: system-ui, sans-serif;
              font-size: 8pt;
              font-weight: 600;
              color: #1e40af;
              background: #eff6ff;
              padding: 1px 6px;
              border-radius: 4px;
              margin-bottom: 4px;
            }
            .q-text {
              text-align: justify;
              margin-bottom: 8px;
            }
            .q-image {
              margin: 8px 0;
              max-width: 320px;
            }
            .q-image img {
              max-width: 100%;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
            }
            .q-options {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-left: 4px;
            }
            .opt-row {
              display: flex;
              align-items: flex-start;
              gap: 6px;
            }
            .opt-key {
              font-weight: bold;
              width: 18px;
              shrink: 0;
            }
            .opt-val {
              flex: 1;
              text-align: justify;
            }

            /* Page Break */
            .page-break {
              page-break-before: always;
            }

            /* LJK Section */
            .ljk-header {
              text-align: center;
              margin-bottom: 16px;
            }
            .ljk-header h3 {
              margin: 0;
              font-size: 13pt;
              text-transform: uppercase;
            }
            .ljk-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px 24px;
              font-family: monospace;
              font-size: 11pt;
            }
            .ljk-item {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 2px 0;
            }
            .ljk-num {
              width: 30px;
              text-align: right;
              font-weight: bold;
            }
            .ljk-bubble {
              color: #475569;
            }

            /* Answer Key Table */
            table.key-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-family: system-ui, sans-serif;
            }
            table.key-table th {
              border: 1px solid #94a3b8;
              background: #f1f5f9;
              padding: 6px 8px;
              font-size: 11px;
              text-align: left;
            }
            table.key-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              vertical-align: top;
            }
          </style>
        </head>
        <body>
          <!-- Top Floating Action Bar (Hidden when printed) -->
          <div class="no-print-bar">
            <div>
              <strong>Naskah Soal Ujian Tryout (Backup Fisik / Cetak PDF)</strong>
              <div style="font-size: 11px; color: #94a3b8;">
                Batch ${batch.batchNumber} - ${batch.training.title} • ${totalQuestions} Butir Soal • Durasi ${duration} Menit
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
            </div>
          </div>

          <div class="content-wrapper">
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- BAGIAN 1: NASKAH SOAL UJIAN PESERTA                             -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="header-kop">
              <img src="${ALARA_LOGO_BASE64}" alt="Logo ALARA" />
              <div class="header-kop-text">
                <h2>LEMBAGA PELATIHAN KETENAGANUKLIRAN ALARA</h2>
                <h3>UJIAN KOMPETENSI / TRYOUT MANDIRI BAPETEN</h3>
                <p>Terakreditasi Badan Pengawas Tenaga Nuklir (BAPETEN) Republik Indonesia</p>
              </div>
            </div>

            <div class="exam-meta-box">
              <div class="meta-item">
                <span class="meta-label">Program Pelatihan</span>
                <span class="meta-val">: <strong>${batch.training.title}</strong></span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Angkatan / Batch</span>
                <span class="meta-val">: Batch ${batch.batchNumber}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Jumlah Butir Soal</span>
                <span class="meta-val">: ${totalQuestions} Butir Pilihan Ganda</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Alokasi Waktu</span>
                <span class="meta-val">: ${duration} Menit</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Metode Ujian</span>
                <span class="meta-val">: Naskah Ujian Cetak (PBT Backup)</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Tanggal Pelaksanaan</span>
                <span class="meta-val">: ${dateFormatted}</span>
              </div>
            </div>

            <div class="participant-identity-box">
              <div style="font-weight: bold; margin-bottom: 6px; font-size: 10pt; color: #1e293b;">
                IDENTITAS PESERTA UJIAN:
              </div>
              <div class="p-field">
                <span class="p-label">Nama Lengkap</span>
                <span class="p-dots"></span>
              </div>
              <div class="p-field">
                <span class="p-label">Nomor Induk Kependudukan (NIK)</span>
                <span class="p-dots"></span>
              </div>
              <div class="p-field">
                <span class="p-label">Instansi / Perusahaan</span>
                <span class="p-dots"></span>
              </div>
              <div class="p-field">
                <span class="p-label">Tanda Tangan Peserta</span>
                <span class="p-dots"></span>
              </div>
            </div>

            <div class="instructions">
              <strong>PETUNJUK PENGERJAAN:</strong>
              <ol>
                <li>Bacalah setiap butir pertanyaan dengan teliti sebelum menentukan jawaban.</li>
                <li>Pilihlah <strong>satu jawaban yang paling tepat</strong> dengan memberi tanda silang (X) atau menghitamkan bulatan pada Lembar Jawaban.</li>
                <li>Dilarang bekerja sama, membuka buku/catatan, atau menggunakan alat komunikasi selama ujian berlangsung.</li>
                <li>Periksa kembali seluruh jawaban Anda sebelum naskah soal dan lembar jawaban diserahkan kepada pengawas.</li>
              </ol>
            </div>

            <div class="questions-list">
              ${questionsHtml}
            </div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- BAGIAN 2: LEMBAR JAWABAN MANUAL (LJK BACKUP)                   -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="page-break"></div>
            
            <div class="header-kop" style="margin-top: 10px;">
              <img src="${ALARA_LOGO_BASE64}" alt="Logo ALARA" />
              <div class="header-kop-text">
                <h2>LEMBAR JAWABAN UJIAN (LJU / LJK BACKUP)</h2>
                <h3>${batch.training.title} – Batch ${batch.batchNumber}</h3>
                <p>Berikan tanda silang (X) atau arsir penuh pada huruf opsi pilihan Anda</p>
              </div>
            </div>

            <div class="participant-identity-box" style="margin-bottom: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="p-field">
                  <span class="p-label" style="width: 100px;">Nama</span>
                  <span class="p-dots"></span>
                </div>
                <div class="p-field">
                  <span class="p-label" style="width: 100px;">No. Peserta</span>
                  <span class="p-dots"></span>
                </div>
                <div class="p-field">
                  <span class="p-label" style="width: 100px;">Instansi</span>
                  <span class="p-dots"></span>
                </div>
                <div class="p-field">
                  <span class="p-label" style="width: 100px;">Tanda Tangan</span>
                  <span class="p-dots"></span>
                </div>
              </div>
            </div>

            <div class="ljk-grid">
              ${ljkRowsHtml}
            </div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- BAGIAN 3: KUNCI JAWABAN & PEMBAHASAN (PEGANGAN PENGAWAS)       -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="page-break"></div>

            <div style="background: #fef2f2; border: 2px dashed #ef4444; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0; color: #b91c1c; font-family: system-ui, sans-serif; font-size: 13pt;">
                DOKUMEN RAHASIA – KUNCI JAWABAN & PEMBAHASAN
              </h3>
              <p style="margin: 4px 0 0 0; font-size: 10pt; color: #7f1d1d; font-family: system-ui, sans-serif;">
                Lampiran ini HANYA diperuntukkan bagi Pengawas Ujian & Instruktur ALARA. Dilarang dibagikan kepada peserta sebelum ujian berakhir.
              </p>
            </div>

            <div style="font-family: system-ui, sans-serif; font-size: 11pt; font-weight: bold; margin-bottom: 8px;">
              Kunci Jawaban Ujian Tryout Batch ${batch.batchNumber} (${batch.training.title}):
            </div>

            <table class="key-table">
              <thead>
                <tr>
                  <th style="text-align: center;">No</th>
                  <th>Topik Materi</th>
                  <th style="text-align: center;">Kunci</th>
                  <th>Uraian Pembahasan Ilmiah & Regulasi BAPETEN</th>
                </tr>
              </thead>
              <tbody>
                ${answerKeyRowsHtml}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[ADMIN_TRYOUT_PDF_ERROR]", error);
    return new NextResponse("Gagal menghasilkan naskah soal PDF", { status: 500 });
  }
}
