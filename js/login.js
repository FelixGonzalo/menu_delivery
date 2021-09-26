const urlPrincipal = "/menu_delivery/"

firebase.auth().onAuthStateChanged( user => {
  if (user) {
    window.location.href = urlPrincipal + 'admin.html';
    var uid = user.uid;
  } else {
    console.log("no existe user")
  }
});

const form_login = document.getElementById("form_login")

form_login.addEventListener('submit', (e) => {
  e.preventDefault()
  var formData = new FormData(e.currentTarget)
  firebase.auth().signInWithEmailAndPassword(formData.get('correo'), formData.get('password'))
    .then((userCredential) => {
      var user = userCredential.user;
    })
    .catch((error) => {
      alert(error.code+": "+error.message)
    });
})


