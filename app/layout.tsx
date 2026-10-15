import type { Metadata, Viewport } from 'next';
export const metadata:Metadata={title:'Makhan Matki · Vrindavan Race',description:'A moonlit Vrindavan adventure with private room chat.'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#041f32'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{margin:0,background:'#041f32'}}>{children}</body></html>}
