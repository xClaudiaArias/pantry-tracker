"use client"; 

import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { firebaseConfig } from "@/firebase";
import { FirebaseAppProvider } from "reactfire";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <html lang="en">
        <head>
          <title>Title</title>
          <meta name='description' content='Description' />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </FirebaseAppProvider>
  );
}
