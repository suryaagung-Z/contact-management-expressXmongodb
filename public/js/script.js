const boxpopup = document.querySelector(".box-popup");
const popup = boxpopup.querySelectorAll("section");

for (let p of popup) {
  p.querySelector("#del").addEventListener("click", () => p.remove());
}
