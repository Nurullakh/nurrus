import React from "react";
import { HeaderWidget } from "@/widgets/header";
import { FooterWidget } from "@/widgets/footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWidget />
      <main className="min-h-screen">{children}</main>
      <FooterWidget />
    </>
  );
}
