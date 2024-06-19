const multer = require("multer");


const SharpMulter = require("sharp-multer");


// optional function to return new File Name
const newFilenameFunction = (og_filename, options) => {
  const newname =
    og_filename.split(".").slice(0, -1).join(".") +
    `${options.useTimestamp ? "-" + Date.now() : ""}` +
    "." +
    options.fileFormat;
  return newname;
};

const storage = SharpMulter({
  destination: (req, file, callback) => callback(null, "images"),

  imageOptions: {
    fileFormat: "webp",
    quality: 80,
    resize: { width: 400, height: 600, resizeMode: "cover" },
  },

  filename: newFilenameFunction, 
});
module.exports = multer({ storage }).single("image"), async (req, res) => {
  console.log(req.file);

  return res.json("File Uploaded Successfully!");
};
