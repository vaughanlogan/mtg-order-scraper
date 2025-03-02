//get scryfall set data
async function getSetData() {
  try {
    let response = await fetch("https://api.scryfall.com/sets");
    if (!response.ok) throw new Error("Network response was not ok");

    let data = (await response.json()).data;
    let setcodedata = {};
    data.forEach((x) => {
      setcodedata[x.name] = x.code;
    });

    browser.storage.local.set({
      lastsetscall: new Date(),
      setcodes: setcodedata,
    });
  } catch (error) {
    console.error(
      "Failed to fetch set data from https://api.scryfall.com/sets"
    );
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
browser.runtime.onInstalled.addListener(() => {
  getSetData();
});

//download final csv
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadCSV") {
    downloadCSV(message.data);
  }
});

//save date range
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "runExtension") {
    const { startDate, endDate } = message;

    // Store the date range in browser.storage.local (including defaults)
    browser.storage.local.set({ dateRange: { startDate, endDate } });

    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        action: "scrape",
      });
    });
  }
});
