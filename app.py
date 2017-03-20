import os
import stripe
from flask import Flask, request, render_template

app = Flask(__name__, static_url_path="")

stripe.api_key = os.environ["UF_STRIPE_TEST_SECRET"]

if not stripe.api_key:
    print("no secret key in environment variable")

# GET route for paying
@app.route("/donate", methods=["GET"])
def donation_page():
    print("donating something")
    return render_template("stripe.html")

# POST route for new payment
@app.route("/payment", methods=["POST"])
def payment_create():
    token = request.form["stripeToken"]
    charge = stripe.Charge.create(
        amount=request.form["amount"],
        currency="usd",
        description="Example charge",
        source=token,
    )
    print(token, charge)
    return "yay!"

# serving static files
@app.route("/static/<path:filename>", methods=["GET"])
def serve_static(filename):
    return app.send_static_file(filename)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, use_reloader=False)