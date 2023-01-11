const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/_contacts");

const Contacts = mongoose.model("contacts", {
  nama: String,
  alamat: String,
  notelp: String,
});

module.exports = Contacts;
