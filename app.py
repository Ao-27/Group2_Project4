# from flask import Flask, render_template, jsonify, request
# import pandas as pd
# import numpy as np
# from flask_cors import CORS
# import os

# app = Flask(__name__)
# CORS(app)

# @app.route('/get_plot_data')
# def get_plot_data():
#     # Your logic to generate plot data
#     fig = go.Figure(data=[go.Scatter(x=[1, 2, 3], y=[4, 5, 6])])  # Example plot
#     graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
#     return graphJSON

# # Set up the static folder path
# static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

# # Load BTC data
# data = pd.read_csv('bitcoin_trading_data.csv', index_col=0)
# next_day_formatted = pd.to_datetime(data.index[-1]) + pd.Timedelta(days=1)

# # Load model predictions
# predicted_close_price = np.nan  # Replace this with the actual value

# # Function to fetch BTC data
# def fetch_btc_data(selected_date):
#     try:
#         # Modify data retrieval based on the selected date if needed
#         historical_close_prices = data[['Close']].tail(60).reset_index().to_dict('records')
#         volatility_data = data[['30d_Rolling_Std']].tail(60).reset_index().to_dict('records')

#         return {
#             'historicalClosePrices': historical_close_prices,
#             'volatilityData': volatility_data,
#             'additionalInfo': {
#                 'next_day': str(next_day_formatted.date()),
#                 'predicted_close_price': predicted_close_price
#             }
#         }
#     except Exception as e:
#         print(f"Error fetching BTC data: {e}")
#         return {'error': str(e)}

# # Flask route to render the HTML page
# @app.route('/')
# def index():
#     return render_template('index.html')

# # Flask route to serve BTC data as JSON
# @app.route('/api/btcdata')
# def btc_data():
#     selected_date = request.args.get('date', default='2023-01-01')  # Default date if not provided
#     data = fetch_btc_data(selected_date)

#     if 'error' in data:
#         return jsonify({'error': data['error']}), 500

#     return jsonify(data)

# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
from flask_cors import CORS
from flask.json import JSONEncoder
import os

# Custom JSON Encoder to handle NaNs
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.float64, np.float32)) and np.isnan(obj):
            return None  # Convert float NaN to None
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
CORS(app)

# Load BTC data
data = pd.read_csv('bitcoin_trading_data.csv', index_col=0)
data.index = pd.to_datetime(data.index)
next_day_formatted = data.index[-1] + pd.Timedelta(days=1)

# Ensure no NaN values in the 'Close' column
data['Close'].fillna(method='ffill', inplace=True)

# Function to fetch BTC data
def fetch_btc_data(selected_date):
    try:
        historical_close_prices = data[['Close']].tail(60).reset_index().to_dict('records')
        volatility_data = data['Close'].rolling(30).std().tail(60).reset_index().to_dict('records')
        corr_matrix = data.corr().reset_index().melt('index').to_dict('records')

        # Replace with actual model prediction
        predicted_close_price = np.nan  # Dummy value for now

        return {
            'historicalClosePrices': historical_close_prices,
            'volatilityData': volatility_data,
            'corrMatrix': corr_matrix,
            'predictedClosePrice': predicted_close_price if not np.isnan(predicted_close_price) else None,
            'nextDay': str(next_day_formatted.date())
        }
    except Exception as e:
        print(f"Error fetching BTC data: {e}")
        return {'error': str(e)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/btcdata')
def btc_data():
    selected_date = request.args.get('date', default='2023-01-01')
    return jsonify(fetch_btc_data(selected_date))

if __name__ == '__main__':
    app.run(debug=True)

