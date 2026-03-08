module.exports.corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

module.exports.handleCors = function(res) {
  Object.entries(this.corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};
