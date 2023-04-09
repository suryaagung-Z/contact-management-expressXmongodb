const { faker } = require("@faker-js/faker");

module.exports = {
  async up(db, client) {
    const generate = 20;
    const contacts = [];

    const render = () => {
      const nama = faker.name.fullName();
      const alamat = faker.address.cityName();
      const notelp = faker.phone.number("0851########");

      return { nama, alamat, notelp };
    };

    for (let i = 0; i < generate; i++) {
      contacts.push(render());
    }

    await db.collection("contacts").insertMany(contacts);
  },

  async down(db, client) {
    await db.collection("contacts").deleteMany({});
  },
};
