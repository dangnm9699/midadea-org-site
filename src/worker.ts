import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
	...handler,
	// createScheduledHandler() so khớp controller.cron nguyên văn để tách hai
	// lane, và mặc định mediaUsageCron là "*/2 * * * *". Đã giãn lịch trong
	// wrangler.jsonc nên phải khai báo lại ở đây cho khớp — nếu không, không
	// chuỗi nào trùng "*/2 * * * *" và lane Media Usage sẽ không bao giờ chạy.
	scheduled: createScheduledHandler({
		generalCron: "*/5 * * * *",
		mediaUsageCron: "*/15 * * * *",
	}),
};
