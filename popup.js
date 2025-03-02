document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitBtn");

    submitButton.addEventListener("click", () => {
        // Get the start and end date values
        let startDate = document.getElementById("dateRangeStart").value || new Date(0).toISOString(); // Default to Unix epoch start
        let endDate = document.getElementById("dateRangeEnd").value || new Date().toISOString(); // Default to current date and time

        // Send the date range to the background script
        browser.runtime.sendMessage({
            action: "runExtension",
            startDate: startDate,
            endDate: endDate
        });
    });
});
