const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 设置静态文件的MIME类型
app.use('/dist', express.static(path.join(__dirname, 'dist'), {
  setHeaders: function (res, pathToFile) {
    if (pathToFile.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    }
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cover.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
