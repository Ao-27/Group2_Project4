<<<<<<< HEAD
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
=======
// // Function to fetch BTC data
// function fetchBTCData(selectedDate) {
//   // Fetch data from Flask API
//   fetch(`/api/btcdata?date=${selectedDate}`)
//       .then(response => response.json())
//       .then(data => {
//           // Process and use the data to create charts
//           createHistoricalChart(data.historicalClosePrices, selectedDate);
//           createBoxPlot(data.volatilityData);  // Update to use the correct data property
//           // Additional charts creation functions if needed
//           displayAdditionalInfo(data.additionalInfo);
//       })
//       .catch(error => console.error("Error fetching BTC data:", error));
// }

// // Function to create a box plot
// function createBoxPlot(volatilityData) {
//   // Log the volatilityData to check its structure
//   console.log("Volatility Data:", volatilityData);

//   // Use the correct property from the data
//   const trace = {
//       y: volatilityData.map(entry => entry['30d_Rolling_Std']),  // Update to use the correct property
//       type: "box"
//   };

//   const data = [trace];

//   const layout = {
//       title: "Box Plot of Bitcoin Trading Volume",
//       xaxis: { title: "Volume" },
//       yaxis: { title: "Value" }
//   };

//   Plotly.newPlot("boxPlot", data, layout);
// }

// // Function to create a correlation heatmap
// function createCorrelationHeatmap(corrMatrix) {
//   const data = [{
//     z: corrMatrix.values,
//     x: corrMatrix.columns,
//     y: corrMatrix.index,
//     type: "heatmap",
//     colorscale: 'RdBu'
//   }];

//   const layout = {
//     title: "Correlation Heatmap",
//     xaxis: { title: "Features" },
//     yaxis: { title: "Features" }
//   };

//   Plotly.newPlot("heatmap", data, layout);
// }

// // Function to handle date selection change
// function updateCharts() {
//   // Dte picker element 
//   const selectedDate = document.getElementById("dateSelector").value;
//   fetchBTCData(selectedDate);
// }

// // Initialize the date picker and fetch initial BTC data
// function init() {
//   // Date picker element 
//   const datePicker = document.getElementById("dateSelector");

//   // Add event listener to handle date selection change
//   datePicker.addEventListener("change", updateCharts);

//   // Fetch initial BTC data for the default date
//   const defaultDate = "2023-11-11"; 
//   fetchBTCData(defaultDate);
// }

// // Call the init function to initialize the date picker and fetch initial BTC data
// init();



// Function to fetch BTC data and render plots
function fetchBTCData() {
  fetch(`/api/btcdata`)
      .then(response => response.json())
      .then(data => {
          createHistoricalChart(data.historicalClosePrices);
          createVolatilityChart(data.volatilityData);
          createCorrelationHeatmap(data.corrMatrix);
          displayPrediction(data.predictedClosePrice, data.nextDay);
      })
      .catch(error => console.error("Error fetching BTC data:", error));
>>>>>>> a465ee533b423e11ac9837672ecf4ec3bc30db8c
}

// Function to create historical price chart
function createHistoricalChart(historicalData) {
  const trace = {
      x: historicalData.map(d => d.Date),
      y: historicalData.map(d => d.Close),
      type: 'scatter',
      name: 'Historical Close Price'
  };
  const layout = { title: 'Historical Bitcoin Prices' };
  Plotly.newPlot('historicalChart', [trace], layout);
}

// Function to create rolling volatility chart
function createVolatilityChart(volatilityData) {
  const trace = {
      x: volatilityData.map(d => d.Date),
      y: volatilityData.map(d => d['30d_Rolling_Std']),
      type: 'scatter',
      name: '30-Day Rolling Volatility'
  };
  const layout = { title: 'Bitcoin 30-Day Rolling Volatility' };
  Plotly.newPlot('volatilityChart', [trace], layout);
}

// Function to create correlation heatmap
function createCorrelationHeatmap(corrMatrix) {
  // Convert the flat array to a 2D matrix
  const matrix = [];
  const labels = [];
  corrMatrix.forEach(row => {
      if (!labels.includes(row.index)) {
          labels.push(row.index);
          matrix.push([]);
      }
      matrix[labels.indexOf(row.index)].push(row.value);
  });

  const data = [{
      z: matrix,
      x: labels,
      y: labels,
      type: 'heatmap',
      colorscale: 'RdBu'
  }];
  const layout = { title: 'Correlation Heatmap' };
  Plotly.newPlot('correlationHeatmap', data, layout);
}

// Function to display model prediction
function displayPrediction(predictedPrice, nextDay) {
  document.getElementById('predictionDisplay').innerHTML = 
      `Predicted Close Price for ${nextDay}: $${predictedPrice}`;
}

// Initialize and fetch BTC data
fetchBTCData();
