// Function to fetch BTC data
function fetchBTCData(selectedDate) {
    // Fetch data from Flask API
    fetch(`/api/btcdata?date=${selectedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if the response contains an error
            if ('error' in data) {
                console.error("Error fetching BTC data:", data.error);
                // Handle the error gracefully, you might want to show a user-friendly message
            } else {
                // Process and use the data to create charts
                createHistoricalChart(data.historicalClosePrices, selectedDate);
                createBoxPlot(data.volatilityData);  // Update to use the correct data property
                // Additional charts creation functions if needed
                displayAdditionalInfo(data.additionalInfo);
            }
        })
        .catch(error => console.error("Fetch error:", error));
}

// Function to create a box plot
function createBoxPlot(volatilityData) {
  // Log the volatilityData to check its structure
  console.log("Volatility Data:", volatilityData);

  // Use the correct property from the data
  const trace = {
      y: volatilityData.map(entry => entry['30d_Rolling_Std']),  // Update to use the correct property
      type: "box"
  };

  const data = [trace];

  const layout = {
      title: "Box Plot of Bitcoin Trading Volume",
      xaxis: { title: "Volume" },
      yaxis: { title: "Value" }
  };

  Plotly.newPlot("boxPlot", data, layout);
}

// Function to create a correlation heatmap
function createCorrelationHeatmap(corrMatrix) {
  const data = [{
    z: corrMatrix.values,
    x: corrMatrix.columns,
    y: corrMatrix.index,
    type: "heatmap",
    colorscale: 'RdBu'
  }];

  const layout = {
    title: "Correlation Heatmap",
    xaxis: { title: "Features" },
    yaxis: { title: "Features" }
  };

  Plotly.newPlot("heatmap", data, layout);
}

// Function to handle date selection change
function updateCharts() {
  // Dte picker element 
  const selectedDate = document.getElementById("dateSelector").value;
  fetchBTCData(selectedDate);
}

// Initialize the date picker and fetch initial BTC data
function init() {
  // Date picker element 
  const datePicker = document.getElementById("dateSelector");

  // Add event listener to handle date selection change
  datePicker.addEventListener("change", updateCharts);

  // Fetch initial BTC data for the default date
  const defaultDate = "2023-11-11"; 
  fetchBTCData(defaultDate);
}

// Call the init function to initialize the date picker and fetch initial BTC data
init();
