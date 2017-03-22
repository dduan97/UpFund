import os
import stripe
import json
from flask import Flask, request, render_template, jsonify

app = Flask(__name__, static_url_path="")

stripe.api_key = os.environ["UF_STRIPE_TEST_SECRET"]

if not stripe.api_key:
    print("no secret key in environment variable")

@app.route("/", methods=["GET"])
def root():
    return render_template("index.html");

# GET route for paying
@app.route("/donate", methods=["GET"])
def donation_page():
    print("donating something")
    return render_template("stripe.html")

@app.route("/thanks", methods=["GET"])
def thank_you_page():
    return render_template("thanks.html")

@app.route("/elements", methods=["GET"])
def elements_page():
    return render_template("elements.html")

# POST route for new payment
@app.route("/payment", methods=["POST"])
def payment_create():
    form_data = json.loads(request.get_json(force=True))
    token = form_data["stripeToken"]["id"]
    print("about to make charge with token ", token);
    try:
        charge = stripe.Charge.create(
            amount=int(100*float(form_data["amount"])),
            currency="usd",
            description="Donation",
            source=token,
            statement_descriptor="UPFUND"
        )
    except stripe.error.CardError as e:
        # Since it's a decline, stripe.error.CardError will be caught
        body = e.json_body
        err  = body['error']

        print("Status is: %s" % e.http_status)
        print("Type is: %s" % err['type'])
        print("Code is: %s" % err['code'])
        # param is '' in this case
        # print("Param is: %s" % err['param'])
        print("Message is: %s" % err['message'])
        return jsonify({"status": "failure", "message": err["message"]})
    except stripe.error.RateLimitError as e:
    # Too many requests made to the API too quickly
        print("stripe rate limit error")
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    except stripe.error.InvalidRequestError as e:
    # Invalid parameters were supplied to Stripe's API
        print("stripe invalid request")
        print(e)
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    except stripe.error.AuthenticationError as e:
    # Authentication with Stripe's API failed
    # (maybe you changed API keys recently)
        print("stripe authentication error")
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    except stripe.error.APIConnectionError as e:
    # Network communication with Stripe failed
        print("stripe api connection error")
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    except stripe.error.StripeError as e:
    # Display a very generic error to the user, and maybe send
    # yourself an email
        print("generic stripe error")
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    except Exception as e:
    # Something else happened, completely unrelated to Stripe
        print("unknown non-stripe error")
        print(e)
        return jsonify({"status": "failure", "message": "We seem to be having issues. Please try again later"})
    return jsonify({"status": "success"})

# serving static files
@app.route("/static/<path:filename>", methods=["GET"])
def serve_static(filename):
    return app.send_static_file(filename)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, use_reloader=False)