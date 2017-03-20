var stripe = Stripe('pk_test_DtDKIGRnnGyTHQG8gNZzaKO4');
var elements = stripe.elements();

var card = elements.create('card', {
  iconStyle: 'solid',
  style: {
    base: {
      color: 'rgba(255, 255, 255, 0.75)',
      iconColor: 'rgba(255, 255, 255, 0.75)',
      lineHeight: '1.75em',
      fontWeight: 100,
      fontFamily: "Roboto, Helvetica, sans-serif",
      fontSize: '1.1em',

      '::placeholder': {
        color: 'rgba(255, 255, 255, 0.75)',
        fontFamily: "Roboto, Helvetica, sans-serif",
      },
    },
    invalid: {
      iconColor: '#e85746',
      color: '#e85746',
    }
  },
  classes: {
    focus: 'is-focused',
    empty: 'is-empty',
  },
});
card.mount('#card-element');

var inputs = Array.from(document.querySelectorAll('input.field'));
inputs.forEach(function(input) {
  input.addEventListener('focus', function() {
    input.classList.add('is-focused');
  });
  input.addEventListener('blur', function() {
    input.classList.remove('is-focused');
  });
  input.addEventListener('keyup', function() {
    if (input.value.length === 0) {
      input.classList.add('is-empty');
    } else {
      input.classList.remove('is-empty');
    }
  });
});

var numberInput = document.getElementById("numberInput");
numberInput.addEventListener('mousewheel', function(e){e.preventDefault();});
// // event listener to update button
// numberInput.addEventListener('blur', function(e){
//   // get the value in the amount field
//   var amount = numberInput.value;
//   document.getElementById("donationSubmit").innerHTML = "Donate $" + amount;
// })

function setOutcome(result) {
  var successElement = document.querySelector('.success');
  var errorElement = document.querySelector('.error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/charges
    successElement.querySelector('.token').textContent = result.token.id;
    successElement.classList.add('visible');
  } else if (result.error) {
    errorElement.textContent = result.error.message;
    errorElement.classList.add('visible');
  }
}

card.on('change', function(event) {
  setOutcome(event);
});

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  var form = document.querySelector('form');
  var extraDetails = {
    name: form.querySelector('input[name=cardholder-name]').value,
  };
  stripe.createToken(card, extraDetails).then(setOutcome);
});