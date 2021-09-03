const db = firebase.firestore();

const menu_platos = document.getElementById("menu_platos")
const workFlow = document.getElementById("workFlow")
const menu_description = document.getElementById("menu_description")

const getPlatos = async () => {
  db.collection("platos").where("show", "==", true).get()
    .then((querySnapshot) => {
      menu_platos.innerHTML = ""
      querySnapshot.forEach((doc) => {
        menu_platos.innerHTML += `
          <div class="plate ${doc.data().state ? '' : 'plate-agotado'}">
            <img src="${doc.data().image}" alt="">
            <div class="plate-info">
              <div class="plate-info-header">
                <p class="plate-name">${doc.data().name}</p>
                <span class="plate-price">${doc.data().price}</span>
              </div>
            </div>
          </div>
        `
      });
      workFlow.style.display = "block"
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

db.collection("negocios").doc("negocio1").get()
  .then((negocio) => {
    if (negocio.exists) {
      if (negocio.data().show) { // true: abierto
        menu_description.innerHTML = negocio.data().message
        getPlatos()
      } else {
        menu_platos.innerHTML = `<p class="message"><i class="fas fa-store-slash"></i> <br>${negocio.data().message}
            <br><br>
            <a href="https://api.whatsapp.com/send?phone=51968679393" class="button-success" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-whatsapp"></i> Reservar menu
            </a>
            <br><br>
            <span>Gracias por su preferencia</span>
          </p>`
      }
    }
  })
  .catch((error) => {
    console.log("Error getting document:", error);
  });