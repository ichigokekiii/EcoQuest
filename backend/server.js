require('./src/config/env');

const app = require('./src/app');
const { getAiStartupStatusMessage } = require('./src/config/aiConfig');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(getAiStartupStatusMessage());
});
