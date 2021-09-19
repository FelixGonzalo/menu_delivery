// Auth

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    //console.log("existe user")
    getDataNegocio()
  } else {
    window.location.href = '/login.html';
  }
});

const btn_salir = document.getElementById('btn_salir')

btn_salir.addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    window.location.href = '/login.html';
  }).catch((error) => {
    alert("No se pudo cerra la sesión !!")
  });
})


// cargar datos

const db = firebase.firestore();
const message = document.getElementById('message')
const radio_open = document.getElementById('open')
const radio_closed = document.getElementById('closed')
const menu_platos = document.getElementById("menu_platos")

const getDataNegocio = () => {
  db.collection("negocios").doc("negocio1").get()
    .then((negocio) => {
      if (negocio.exists) {
        message.value = negocio.data().message
        if (negocio.data().show) {
          radio_open.checked = true
        } else {
          radio_closed.checked = true
        }
        getPlatos()
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}


const getPlatos = async () => {
  menu_platos.innerHTML = '<img src="img/loading.gif" alt="" class="loading">'
  db.collection("platos").orderBy("show", "desc").get()
    .then((querySnapshot) => {
      menu_platos.innerHTML = ""
      querySnapshot.forEach((doc) => {
        menu_platos.innerHTML += `
          <div
            key = ${doc.id}
            class="plate-small
            ${doc.data().show ? '' : 'plate-oculto'}
            ${doc.data().state ? '' : 'plate-small-agotado'}"
          >
            <div class="plate-small-info" key=${doc.id}>
              <img src="${doc.data().image}" alt="" key = ${doc.id}>
              <div key=${doc.id}>
                <p class="plate-small-name" key = ${doc.id}>${doc.data().name}</p>
                <span class="plate-small-price" key = ${doc.id}>${doc.data().price}</span>
              </div>
            </div>
          </div>
        `
      });
    })
    .catch((error) => {
      console.log("Error getting documents negocio: ", error);
    });
}
/*
  <div class="plate-small-options">
    <button class="button-danger">Eliminar</button>
    <button class="button-success">Editar</button>
  </div>
*/


// formularios

const form_negocio = document.getElementById('form_negocio')

form_negocio.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  if (formData.get('state') === 'true') {
    updateNegocio(formData.get('message'), true)
  } else {
    updateNegocio(formData.get('message'), false)
  }
})

const updateNegocio = (message, show) => {
  var sfDocRef = db.collection("negocios").doc("negocio1");

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(sfDocRef).then((sfDoc) => {
      if (!sfDoc.exists) {
        throw "Document does not exist!";
      }
      transaction.update(sfDocRef, { message: message, show: show})
    });
  }).then(() => {
    alert("Actualización correcta del negocio!!");
  }).catch((error) => {
    console.log("Transaction failed: ", error);
  });
}


/* editar un plato */

const form_plato = document.getElementById('form_plato')
const namePlato = document.getElementById('name')
const pricePlato = document.getElementById('price')
const imagePlato = document.getElementById('image')
const radio_ver = document.getElementById('ver')
const radio_ocultar = document.getElementById('ocultar')
const radio_noagotado = document.getElementById('noagotado')
const radio_agotado = document.getElementById('agotado')
const keyPlato = document.getElementById('key')
const btn_plato = document.getElementById('btn_plato')

const getPlato = (idPlato) => {
  db.collection("platos").doc(idPlato).get()
    .then((plato) => {
      if (plato.exists) {
        keyPlato.value = idPlato
        namePlato.value = plato.data().name
        pricePlato.value = plato.data().price
        imagePlato.value = plato.data().image

        if (plato.data().show) {
          radio_ver.checked = true
        } else {
          radio_ocultar.checked = true
        }

        if (plato.data().state) {
          radio_noagotado.checked = true
        } else {
          radio_agotado.checked = true
        }
        console.log("termino")
      }
    })
    .catch((error) => {
      console.log("Error getting document platos:", error);
    });
}

menu_platos.addEventListener('click', (e) => {
  getPlato(e.target.getAttribute('key'))
  console.log(e.target.getAttribute('key'))
})


form_plato.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  if (e.target.key.value !== "agregar") {
    if (formData.get('statePlate') === 'true') {
      if (formData.get('show') === 'true') {
        updatePlato(formData.get('key'), formData.get('name'), formData.get('price'), formData.get('image'), true, true)
      } else {
        updatePlato(formData.get('key'), formData.get('name'), formData.get('price'), formData.get('image'), false, true)
      }
    } else {
      if (formData.get('show') === 'true') {
        updatePlato(formData.get('key'), formData.get('name'), formData.get('price'), formData.get('image'), true, false)
      } else {
        updatePlato(formData.get('key'), formData.get('name'), formData.get('price'), formData.get('image'), false, false)
      }
    }
  } else {
    console.log("agregar plato")

    var idPlatoFormateado = formData.get('name').toLowerCase().replace(/ /g, "");
    switch (formData.get('statePlate')) {
      case 'true':
        if (formData.get('show') === 'true') {
          addPlato(idPlatoFormateado, formData.get('name'), formData.get('price'), formData.get('image'), true, true)
        } else {
          addPlato(idPlatoFormateado, formData.get('name'), formData.get('price'), formData.get('image'), false, true)
        }
        break;
      case 'false':
        if (formData.get('show') === 'true') {
          addPlato(idPlatoFormateado, formData.get('name'), formData.get('price'), formData.get('image'), true, false)
        } else {
          addPlato(idPlatoFormateado, formData.get('name'), formData.get('price'), formData.get('image'), false, false)
        }
        break;
    }

  }
})


const updatePlato = (idPlato, name, price, image, show, state) => {
  var sfDocRef = db.collection("platos").doc(idPlato);
  return db.runTransaction((transaction) => {
    return transaction.get(sfDocRef).then((sfDoc) => {
      if (!sfDoc.exists) {
        throw "Document does not exist!";
      }
      transaction.update(sfDocRef, { name, price, image, show, state })
    });
  }).then(() => {
    alert("Actualización correcta del plato!!");
    form_plato.reset()
    keyPlato.value = "agregar"
    getPlatos()
  }).catch((error) => {
    console.log("Transaction failed: ", error);
  });
}

const addPlato = (idPlato, name, price, image, show, state) => {
  db.collection("platos").doc(idPlato).set({
    name, price, image, show, state
  })
    .then(() => {
      console.log("Nuevo plato agregado!");
      form_plato.reset()
      getPlatos()
    })
    .catch((error) => {
      console.error("Error al agregar un nuevo plato: ", error);
    });
}