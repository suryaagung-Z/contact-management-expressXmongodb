// VAR
const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const { validationResult, body, param } = require("express-validator");

const Contacts = require("./sys/contact");

const app = express();
const port = 3000;

// APP
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "ssshhh",
    name: "sid",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 5000 },
  })
);

// index page
app.get("/", (req, res) => {
  res.render("template", {
    title: "Index",
    main: "index",
  });
});

// about page
app.get("/about", (req, res) => {
  res.render("template", {
    title: "About",
    main: "about",
  });
});

// root contact
app.get("/contact", async (req, res) => {
  const messages =
    req.session.messages != undefined ? req.session.messages : [];
  res.render("template", {
    title: "Kontak",
    main: "contact",
    linkcss: ["contact.css"],
    contacts: await Contacts.find({}),
    messages,
  });
});

// add contact page
app.get("/contact/add", (req, res) => {
  const messages =
    req.session.messages != undefined ? req.session.messages : [];
  res.render("template", {
    title: "Tambah Kontak",
    main: "add",
    linkcss: ["contact.css"],
    messages,
  });
});

// add contact function
app.post(
  "/contact/add",
  body("nama").custom(async (val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("Nama ga boleh kosong ajg!");
    } else if ((await Contacts.findOne({ nama: val }).exec()) != null) {
      throw new Error("Nama telah digunakan, gunakan nama lain");
    }

    return true;
  }),
  body("alamat").custom((val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("Alamat ga boleh kosong ajg!");
    }
    return true;
  }),
  body("notelp").custom((val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("No.telp ga boleh kosong ajg!");
    }
    return true;
  }),
  body("notelp", "No.telp tidak valid").isMobilePhone("id-ID"),
  (req, res) => {
    const validresult = validationResult(req);
    if (!validresult.isEmpty()) {
      const errors = validresult.array();
      errors.forEach((val) => {
        val["bg"] = "red";
      });

      req.session.messages = errors;
      res.redirect("/contact/add");
      return false;
    }

    Contacts.insertMany(req.body, (err, doc) => {
      if (err) {
        req.session.messages = [{ msg: "Terdapat kesalahan!", bg: "red" }];
        res.redirect("/contact");
      } else {
        req.session.messages = [{ msg: "Data berhasil ditambah", bg: "green" }];
        res.redirect("/contact");
      }
    });
  }
);

// update contact page
app.get(
  "/contact/update/:id",
  param("id").custom(async (val) => {
    if ((await Contacts.findById(val)) == null) {
      throw new Error("Kontak tidak ditemukan");
    }
    return true;
  }),
  async (req, res) => {
    const validresult = validationResult(req);
    if (!validresult.isEmpty()) {
      const errors = validresult.array();
      errors.forEach((val) => {
        val["bg"] = "red";
      });
      req.session.messages = errors;
      res.redirect("/contact");
      return false;
    }

    const contact = await Contacts.findById(req.params.id);
    const messages =
      req.session.messages != undefined ? req.session.messages : [];
    res.render("template", {
      title: "Perbarui Kontak",
      main: "update",
      linkcss: ["contact.css"],
      messages,
      contact,
    });
  }
);

// update contact function
app.put(
  "/contact/update",
  body("id").custom(async (val, { req }) => {
    const getById = await Contacts.findById(val);
    if (getById == null) {
      throw new Error("Kontak tidak ditemukan");
    } else if (getById.get("nama") != req.body.nama) {
      const withoutCurrentContact = await Contacts.find().and([
        { nama: { $eq: req.body.nama } },
        { _id: { $ne: getById.get("_id") } },
      ]);
      if (withoutCurrentContact.length > 0) {
        throw new Error("Nama telah digunakan, gunakan nama lain");
      }
    }
    return true;
  }),
  body("nama").custom((val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("Nama ga boleh kosong ajg!");
    }
    return true;
  }),
  body("alamat").custom((val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("Alamat ga boleh kosong ajg!");
    }
    return true;
  }),
  body("notelp", "No.telp tidak valid").isMobilePhone("id-ID"),
  body("notelp").custom((val) => {
    val = val.trim();
    if (val == "") {
      throw new Error("No.telp ga boleh kosong ajg!");
    }
    return true;
  }),
  (req, res) => {
    const validresult = validationResult(req);
    if (!validresult.isEmpty()) {
      const errors = validresult.array();
      errors.forEach((val) => {
        val["bg"] = "red";
      });
      req.session.messages = errors;
      res.redirect("/contact");
      return false;
    }

    Contacts.updateOne(
      { _id: req.body.id },
      { nama: req.body.nama, alamat: req.body.alamat, notelp: req.body.notelp },
      (err) => {
        if (err) {
          req.session.messages = [{ msg: "Terdapat kesalahan!", bg: "red" }];
          res.redirect("/contact");
        } else {
          req.session.messages = [
            { msg: "Data berhasil diperbarui", bg: "green" },
          ];
          res.redirect("/contact");
        }
      }
    );
  }
);

// delete contact function
app.delete(
  "/contact/del",
  body("id").custom(async (val) => {
    if ((await Contacts.findById(val)) == null) {
      throw new Error("Kontak tidak ditemukan");
    }
    return true;
  }),
  (req, res) => {
    const validresult = validationResult(req);
    if (!validresult.isEmpty()) {
      const errors = validresult.array();
      errors.forEach((val) => {
        val["bg"] = "red";
      });
      req.session.messages = errors;
      res.redirect("/contact");
      return false;
    }

    Contacts.findByIdAndDelete(req.body.id, (err, doc) => {
      if (err) {
        req.session.messages = [{ msg: "Terdapat kesalahan!", bg: "red" }];
        res.redirect("/contact");
      } else {
        req.session.messages = [{ msg: "Data berhasil dihapus", bg: "green" }];
        res.redirect("/contact");
      }
    });
  }
);

app.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Successfully connected port ${port}`);
});
