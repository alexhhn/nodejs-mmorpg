function signIn() {
  const body = {
    email: document.forms[0].elements[0].value,
    password: document.forms[0].elements[1].value,
  };

  fetch('/login', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referer',
    body: JSON.stringify(body),
  }).then((response) => {
    if (response.status !== 200) throw new Error(response.error);
    window.location.replace('/game.html');
  })
    .catch((error) => {
      window.alert(error.message);
      window.location.replace('/index.html');
    });
}

function forgotPassword() {
  console.log('forgot password works');
}

function resetPassword() {
  console.log('reset password works');
} 