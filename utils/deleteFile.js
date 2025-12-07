const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, "../public/", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log("Đã xóa thành công", fullPath);
  } else {
    console.log("File không tồn tại:", fullPath);
  }
};

module.exports = { deleteFile };
