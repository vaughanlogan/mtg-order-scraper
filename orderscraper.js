async function scrapeOrders() {
	let orders = [];

	//extract raw orders
	const raw_orders = document.querySelectorAll(".orderWrap");

	//create json from raw orders
	for (let order of raw_orders) {
		let order_date = new Date(
			order.querySelector(
				'[data-aid="spn-sellerorderwidget-orderdate"]'
			).innerText
		);

		let order_number = order
			.querySelector(".orderHeader")
			.children[2].innerText.split("\n")[1];

		let raw_order_items = order.querySelectorAll(".trOdd, .trEven");

		let order_items = [];

		for (let item of raw_order_items) {
			let item_id = item
				.querySelector(".orderThumbnail")
				.attributes["data-original"].value.split("product/")[1]
				.split("_")[0];

			let item_cond = item
				.querySelector(".orderHistoryDetail")
				.innerText.split("Condition: ")[1]
				.split(" Foil")[0];

			let item_foil = item
				.querySelector(".orderHistoryDetail")
				.innerText.includes("Foil")
				? "foil"
				: "";

			let item_price = item
				.querySelector(".orderHistoryPrice")
				.innerText.split("$")[1];

			let item_count = item.querySelector(".orderHistoryQuantity").innerText;

			let item_obj = {
				id: item_id,
				Name: "",
				Edition: "",
				Language: "",
				"Collector Number": "",
				Condition: item_cond,
				Foil: item_foil,
				Price: item_price,
				Count: item_count,
			};

			order_items.push(item_obj);
		}

		let order_obj = {
			number: order_number,
			date: order_date,
			items: order_items,
		};

		orders.push(order_obj);
	}

	return orders;
}

//filter orders by date range then create array of items
async function formatOrders(orders) {
	const startdate = new Date(
		(await browser.storage.local.get("dateRange")).dateRange.startDate
	);
	const enddate = new Date(
		(await browser.storage.local.get("dateRange")).dateRange.endDate
	);

	filtered = orders.filter(
		(order) => order.date > startdate && order.date < enddate
	);
	finalitems = [];
	for (let order of filtered) {
		for (let item of order.items) {
			finalitems.push(item);
		}
	}
	return finalitems;
}

// Send the CSV data to the background script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.action === "scrape") {
		let orders = await scrapeOrders();
		let scraped_items = await formatOrders(orders);

		browser.runtime.sendMessage({
			action: "receiveItems",
			data: scraped_items,
		});
	}
});
