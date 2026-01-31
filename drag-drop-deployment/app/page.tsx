"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirect to game page on mount
    window.location.href = "/game";
  }, []);

  return null;
}
