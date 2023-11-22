import os
import numpy as np
import pandas as pd
from flask import Flask, render_template, jsonify, request 
import base64
import plotly.express as px
from io import BytesIO
import plotly.io as pio
from flask_cors import CORS  # mport for CORS support

# Load BTC data
data = pd.read_csv('bitcoin_trading_data.csv', index_col=0)
next_day_formatted = pd.to_datetime(data.index[-1]) + pd.Timedelta(days=1)

# Load model predictions
predicted_close_price = np.nan  # actual value????

# Function to fetch BTC data
def fetch_btc_data(selected_date):
    try:
        # To modify data retrieval based on the selected date
        historical_close_prices = data[['Close']].tail(60).reset_index().to_dict('records')
        print(data.columns)

        volatility_data = data[['Close']].tail(60).reset_index().to_dict('records')
        corr_matrix = data[['Close', 'Open', 'High', 'Low', 'Volume']].dropna().corr()

        # Additional data for volatility heatmap and box plot
        volatility_chart = px.line(data, x=data.index, y='Close', title='Bitcoin 30-Day Rolling Volatility')
        volatility_chart.update_layout(title='Bitcoin 30-Day Rolling Volatility', xaxis_title='Date', yaxis_title='Close')

        # Use Plotly's static image export API 
        img_bytes = pio.to_image(volatility_chart, format="png", engine="kaleido")
        volatility_plot_data = base64.b64encode(img_bytes).decode()

        box_plot_chart = px.box(data, y='Volume', title='Box Plot of Bitcoin Trading Volume')
        box_plot_img = BytesIO()
        box_plot_chart.write_html(box_plot_img, full_html=False)
        box_plot_img.seek(0)
        box_plot_data = base64.b64encode(box_plot_img.getvalue()).decode()

        # Ensure 'additionalInfo' key is always present
        data['additionalInfo'] = {
            'next_day': str(next_day_formatted.date()),
            'predicted_close_price': predicted_close_price,
            'volatilityPlot': volatility_plot_data,
            'boxPlot': box_plot_data
        }

        return {
            'historicalClosePrices': historical_close_prices,
            'volatilityData': volatility_data,
            'corrMatrix': corr_matrix,
            'additionalInfo': data['additionalInfo']
        }
    except Exception as e:
        print(f"Error fetching BTC data: {e}")
        return {'error': str(e), 'additionalInfo': {}}

# Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Flask route to render the main HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Flask route to serve BTC data as JSON
@app.route('/api/btcdata')
def btc_data():
    selected_date = request.args.get('date', default='2023-11-11')  # Default date if not selected
    data = fetch_btc_data(selected_date)

    if 'error' in data:
        return jsonify({'error': data['error']}), 500

    return jsonify(data)

# Flask route to serve volatility chart as HTML
@app.route('/volatility_chart')
def volatility_chart():
    selected_date = request.args.get('date', default='2023-11-11') 

    if 'error' in data:
        return jsonify({'error': data['error']}), 500

    return render_template('volatility_chart.html', plot_data=data['additionalInfo']['volatilityPlot'])

# Flask route to serve box plot as HTML
@app.route('/box_plot')
def box_plot():
    return render_template('box_plot.html', plot_data=data['additionalInfo']['boxPlot'])

# Flask route to serve correlation heatmap as HTML
@app.route('/correlation_heatmap')
def correlation_heatmap():
    corr_chart = px.imshow(data.corr(), text_auto=True, color_continuous_scale='RdBu', aspect="auto")
    corr_img = BytesIO()
    corr_chart.write_html(corr_img, full_html=False)
    corr_img.seek(0)
    corr_plot_data = base64.b64encode(corr_img.getvalue()).decode()

    return render_template('correlation_heatmap.html', plot_data=corr_plot_data)

if __name__ == '__main__':
    app.run(debug=True)