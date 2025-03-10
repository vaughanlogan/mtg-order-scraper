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

async function scrapeOrders() {
  let setcodes = (await browser.storage.local.get("setcodes")).setcodes;

  let orders = [];

  //extract raw orders
  const raw_orders = document.getElementsByClassName("orderWrap");

  //create json from raw orders
  for (const x of raw_orders) {
    orders.push({
      date: new Date(
        x.querySelector(
          '[data-aid="spn-sellerorderwidget-orderdate"]'
        ).innerText
      ),
      id: x
        .getElementsByClassName("orderHeader")[0]
        .children[2].innerText.split("\n")[1],
      items: Array.from(
        x
          .getElementsByClassName("orderTable")[0]
          .querySelectorAll(".trOdd,.trEven")
      ).map(
        (i) =>
          new Object({
            Count: i.getElementsByClassName("orderHistoryQuantity")[0]
              .innerText,
            Name: "\""+i
              .getElementsByClassName("orderHistoryItems")[0]
              .getElementsByTagName("a")[0].innerText+"\"",
            Edition:
              setcodes[
                i
                  .getElementsByClassName("orderHistoryItems")[0]
                  .getElementsByTagName("span")[0]
                  .innerText.split("\n")[1]
                  .trimEnd()
              ],
            Condition: i
              .getElementsByClassName("orderHistoryDetail")[0]
              .innerText.split("Condition: ")[1]
              .split(" Foil")[0]
              .replace("Moderately ", ""),
            Foil:
              i
                .getElementsByClassName("orderHistoryDetail")[0]
                .innerText.split("Condition: ")[1]
                .split(" Foil").length == 2,
            "Purchase Price": parseFloat(
              i
                .getElementsByClassName("orderHistoryPrice")[0]
                .innerText.substring(1)
            ),
          })
      ),
    });
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
    let finalitems = await formatOrders(orders);
    let csv = jsonToCsv(finalitems);

    browser.runtime.sendMessage({
      action: "downloadCSV",
      data: csv,
    });
  }
});
