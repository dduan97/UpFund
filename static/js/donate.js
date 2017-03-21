var stripe = Stripe('pk_test_DtDKIGRnnGyTHQG8gNZzaKO4');
var elements = stripe.elements();

var card = elements.create('card', {
  iconStyle: 'solid',
  style: {
    base: {
      color: 'rgba(0, 0, 0, 0.9)',
      iconColor: 'rgba(0, 0, 0, 0.9)',
      lineHeight: '1.75em',
      fontWeight: 300,
      fontFamily: "Roboto, Helvetica, sans-serif",
      fontSize: '1.1em',

      '::placeholder': {
        color: 'rgba(0, 0, 0, 0.5)',
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

function objectifyForm(formArray) {//serialize data function

  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function setOutcome(result) {
  var errorElement = document.querySelector('.error');
  errorElement.classList.remove('visible');

  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/charges
    // successElement.querySelector('.token').textContent = result.token.id;
    // send a post request to our thing TODO
    formJSON = objectifyForm($("#stripe-form").serializeArray());
    formJSON["stripeToken"] = result.token;
    formJSON = JSON.stringify(formJSON);
    console.log(formJSON);
    $.ajax({
      url: "/payment",
      method: "POST",
      data: JSON.stringify(formJSON),
      success: function(res){
        if (res["status"] == "success") {
          $("#donationSubmit").html("<span style='font-size: 1.5em'>Success!<span>");
          window.location = "/";
        } else {
          $("#donationSubmit").html("<span style='font-size: 1.5em'>Donate<span>");
          errorElement.textContent = res["message"];
          errorElement.classList.add("visible");
        }
      },
      contentType: "application/json"});
    // while waiting for the response
    $("#donationSubmit").html("<span style='font-size: 1.5em'>Processing...<span>");
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