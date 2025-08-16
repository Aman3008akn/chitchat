const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const uiConfigPath = path.join(__dirname, '..', '..', 'ui-config.json');
    const uiConfig = JSON.parse(fs.readFileSync(uiConfigPath, 'utf8'));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uiConfig)
    };
  } catch (error) {
    console.error("Error reading ui-config.json:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load UI config' })
    };
  }
};
