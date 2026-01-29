// hide-nav-links.js
// Oculta los enlaces MY FRIENDS y MY PATHS si el usuario no está loggeado


function hideNavLinks() {
  if (!localStorage.getItem('userLoggedIn')) {
    var nav = document.querySelector('.main-nav');
    if (nav) {
      var friends = nav.querySelector('a[href="/myfriends"]');
      if (friends) friends.style.display = 'none';
      var paths = nav.querySelector('a[href="#"], a[href="/mypaths"]');
      if (paths) paths.style.display = 'none';
    }
  }
}
window.hideNavLinks = hideNavLinks;
