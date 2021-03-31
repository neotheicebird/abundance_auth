import { Component, OnInit, Inject } from '@angular/core';
import * as donation_prices from '../../../../donation_prices.json';
import {loadStripe} from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { CookieService } from 'ngx-cookie';


export enum PaymentStage {
  Unpaid = 0,
  SelectPayment = 1,
  CardInfo = 2,
  Paid = 3,
}

@Component({
  selector: 'donate',  // <donate></donate>
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css'],
})
export class DonateComponent implements OnInit{
  title = 'Donation Payment By Stripe Example';
  Stage = PaymentStage.Unpaid;
  currency:string = 'usd';
  price_id:string = 'price_zero';
  donationPrices = donation_prices;
  currencies:string[];
  prices:string[];
  stripePromise = loadStripe(environment.stripe_key);
  payment_success = null
  private readonly notifier: NotifierService;
  
  constructor(private route: ActivatedRoute, 
    notifierService: NotifierService, 
    private cookieService: CookieService) {
      this.notifier = notifierService;
    }

  ngOnInit() {
    // check using Auth0 metadata if customer has paid
    // if yes, this.Stage = PaymentStage.Paid

    this.currencies = Object.keys(donation_prices["default"]);
    this.prices = donation_prices["default"][this.currency];

    this.route.queryParams
      .subscribe(params => {
        console.log(params); // { payment_success: true/false }

        this.payment_success = params.payment_success;
        console.log("Payment status")
        console.log(this.payment_success);

        if (this.payment_success === "true") {  // query param payment_success is a string
          console.log("True")
          this.notifier.notify('success', 'Donation successfully recieved. Thank You!');
        } else if (this.payment_success === "false") {
          console.log("False")
          this.notifier.notify('error', 'Payment failed');
        }
      }
    );

  }

  public get paymentStage(): typeof PaymentStage {
    return PaymentStage; 
  }

  onDonate() {
    console.log("onDonate")
    console.log("Cookie get: ")
    console.log(this.cookieService.get("auth0.is.authenticated"))
    if (this.cookieService.get("auth0.is.authenticated")) {
      this.Stage = PaymentStage.SelectPayment;
    } else {
      this.notifier.notify('error', 'Please login or signup to donate');
    }
  }

  onZeroPay() {
    this.Stage = PaymentStage.Paid;
  }

  async onCheckout() {
    // this.Stage = PaymentStage.CardInfo;
    // https://www.unimedia.tech/2020/09/27/integrate-stripe-with-angular/

      // Call your backend to create the Checkout session.
      // When the customer clicks on the button, redirect them to Checkout.
      const stripe = await this.stripePromise;
      const { error } = await stripe.redirectToCheckout({
        mode: "payment",
        lineItems: [{ price: this.price_id, quantity: 1 }],
        successUrl: `${window.location.href}?payment_success=true`,
        cancelUrl: `${window.location.href}?payment_success=false`,
      });
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `error.message`.
      if (error) {
        console.log(error);
      }
  }
}
