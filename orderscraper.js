
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

function scrapeOrders() {
  let orders = [];

  //extract raw orders
  const raw_orders = document.getElementsByClassName("orderWrap");
  console.log("RAW ORDERS:");
  console.log(raw_orders);

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
        .children[2].innerText.substring(13),
      items: Array.from(
        x
          .getElementsByClassName("orderTable")[0]
          .querySelectorAll(".trOdd,.trEven")
      ).map(
        (i) =>
          new Object({
            Count: i.getElementsByClassName("orderHistoryQuantity")[0]
              .innerText,
            Name: i
              .getElementsByClassName("orderHistoryItems")[0]
              .getElementsByTagName("a")[0].innerText,
            Edition: i
              .getElementsByClassName("orderHistoryItems")[0]
              .getElementsByTagName("span")[0]
              .lastChild.textContent.substring(2)
              .trimEnd(),
            Condition: i
              .getElementsByClassName("orderHistoryDetail")[0]
              .innerText.split("Condition: ")[1]
              .split(" Foil")[0],
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
//filter orders by date range

//need to change full edition name for set code https://moxfield.com/sets

let finalorders = [];
finalorders.push(scrapeOrders());

console.log("ORDERS:");
console.log(finalorders);
