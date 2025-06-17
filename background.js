//convert json to csv
function jsonToCsv(jsonData) {
	let csv = "";

	// Extract headers
	const headers = Object.keys(jsonData[0]);
	csv += headers.join(",") + "\n";

	// Extract values
	jsonData.forEach((obj) => {
		const values = headers.map((header) => obj[header]);
		csv += values.join(",") + "\n";
	});

	return csv;
}

//scryfall tcgplayer id request
async function getCardData(id) {
	try {
		await new Promise((resolve) => setTimeout(resolve, 50));
		let response = await fetch(
			`https://api.scryfall.com/cards/tcgplayer/${id}`,
			{
				headers: {
					"User-Agent":
						"TCGPlayer MTG Order Scraper/v1.1 by Vaughan Logan (Firefox add-on)",
					Accept: "*/*",
				},
			}
		);
		if (!response.ok) throw new Error("Network response was not ok");

		let data = await response.json();

		return data;
	} catch (error) {
		console.error("Failed to fetch card data.");
	}
}

//define csv download function
function downloadCSV(csvString, filename = "orderdata.csv") {
	// Create a Blob from the CSV string
	const blob = new Blob([csvString], { type: "text/csv" });

	// Create an object URL for the Blob
	const url = URL.createObjectURL(blob);

	// Trigger the download
	browser.downloads.download({
		url: url,
		filename: filename,
		saveAs: false,
	});

	// Revoke the object URL after a short delay to free up memory
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

//initialize extension
browser.runtime.onInstalled.addListener(() => {});

//parse scraped items
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "receiveItems") {
		(async () => {
			let items = message.data;

			let final_items = [];

			for (let item of items) {
				let item_data = await getCardData(item.id);

				let item_obj = {
					Name: item_data.name,
					Edition: item_data.set,
					Language: item_data.lang,
					"Collector Number": item_data.collector_number,
					Condition: item.Condition,
					Foil: item.Foil,
					Price: item.Price,
					Count: item.Count,
				};

				final_items.push(item_obj);
			}

			downloadCSV(jsonToCsv(final_items));
		})();
		return true;
	}
});

//run extension when button is pressed
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.action === "runExtension") {
		const { startDate, endDate } = message;

		// Store the date range in browser.storage.local (including defaults)
		browser.storage.local.set({ dateRange: { startDate, endDate } });

		//activate scraper
		browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			browser.tabs.sendMessage(tabs[0].id, {
				action: "scrape",
			});
		});
	}
});
