"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PengaturanIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pengaturan/tema");
  }, [router]);

  return null;
}
