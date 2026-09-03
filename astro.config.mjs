import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	// Astro dùng cho URL tuyệt đối (rss.xml.ts đọc `site`).
	site: "https://midadean.org",
	// Lightning CSS mặc định hạ cấp light-dark() thành polyfill hai biến
	// switch, và nhánh dark của polyfill chỉ được kích bởi
	// @media (prefers-color-scheme: dark) — tức là theo hệ điều hành.
	// Nút đổi theme ở footer chỉ đổi `color-scheme` trên <html>, không đổi
	// được media query đó, nên bấm nút chỉ thấy scrollbar đổi màu còn 149
	// token màu thì đứng yên. Nâng target lên mức có light-dark() gốc
	// (Chrome 123 / Safari 17.5 / Firefox 120) để giữ nguyên hàm này.
	vite: {
		build: { cssTarget: "esnext" },
	},
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			// Origin người dùng thật sự mở. Không đặt thì EmDash rơi về origin
			// của request, nên canonical/OG đổi theo host truy cập — vào bằng
			// *.workers.dev là sinh ra URL workers.dev, trùng lặp với domain thật.
			// Giá trị này cũng định nghĩa rpId cho passkey.
			siteUrl: "https://midadean.org",
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin()],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
