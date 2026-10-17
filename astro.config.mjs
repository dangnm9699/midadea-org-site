import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { readFileSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

/**
 * @font-face variants for a locally installed @fontsource package: one per subset × weight × style,
 * each limited to its subset's unicode-range (so browsers only download what a page uses).
 */
function fontsource(pkg, { weights, styles = ["normal"], subsets }) {
	const ranges = JSON.parse(readFileSync(new URL(`./node_modules/@fontsource/${pkg}/unicode.json`, import.meta.url), "utf8"));
	return subsets.flatMap((subset) =>
		weights.flatMap((weight) =>
			styles.map((style) => ({
				src: [`./node_modules/@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-${style}.woff2`],
				weight,
				style,
				unicodeRange: ranges[subset].split(","),
			})),
		),
	);
}

export default defineConfig({
	// Astro dùng cho URL tuyệt đối (rss.xml.ts đọc `site`). Blog đã chuyển sang subdomain.
	site: "https://blog.midadean.org",
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
			// Blog chạy ở blog.midadean.org, apex là trang chủ Mida Dean. siteUrl vẫn để
			// apex vì nó định nghĩa rpId của passkey: đổi sang blog.* thì passkey hiện có
			// (rpId = midadean.org) không dùng được nữa. allowedOrigins cho phép đăng nhập
			// từ subdomain. Canonical của bài viết lấy theo origin của request (blog.*).
			// Muốn đổi hẳn: tạo passkey mới sau khi đổi siteUrl, khi đang đăng nhập.
			allowedOrigins: ["https://blog.midadean.org"],
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin()],
		}),
	],
	// Font lấy từ gói @fontsource đã cài (devDependencies), không gọi Google lúc build:
	// build ở máy/CI nào cũng ra cùng một bộ font, kể cả khi không vào được fonts.google.com.
	fonts: [
		// subsets "vietnamese" bắt buộc: thiếu thì ế ộ ừ đ rơi về font hệ điều hành.
		{
			provider: fontProviders.local(),
			name: "Noto Serif",
			cssVariable: "--font-body",
			options: { variants: fontsource("noto-serif", { weights: [400, 600], styles: ["normal", "italic"], subsets: ["latin", "latin-ext", "vietnamese"] }) },
			fallbacks: ["Georgia", "Times New Roman", "serif"],
		},
		// tokens.css khai báo --font-heading: Inter cho tiêu đề, nav và nhãn meta.
		{
			provider: fontProviders.local(),
			name: "Inter",
			cssVariable: "--font-heading",
			options: { variants: fontsource("inter", { weights: [400, 500, 600], subsets: ["latin", "latin-ext", "vietnamese"] }) },
			fallbacks: ["system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.local(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			options: { variants: fontsource("jetbrains-mono", { weights: [400, 500], subsets: ["latin", "latin-ext", "vietnamese"] }) },
			fallbacks: ["ui-monospace", "SFMono-Regular", "monospace"],
		},
	],
	devToolbar: { enabled: false },
});
