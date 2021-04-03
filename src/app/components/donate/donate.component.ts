import { Component, OnInit, Inject } from '@angular/core';
import * as donation_prices from '../../../../donation_prices.json';
import {loadStripe} from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { CookieService } from 'ngx-cookie';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { environment as env } from '../../../environments/environment';
import { concatMap, tap, pluck } from 'rxjs/operators';


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
  metadata = null;
  userId = null;
  
  constructor(private route: ActivatedRoute,
    private router: Router, 
    notifierService: NotifierService, 
    private cookieService: CookieService,
    public auth: AuthService, 
    private http: HttpClient) {
      this.notifier = notifierService;
    }

  ngOnInit() {
    // check using Auth0 metadata if customer has paid
    // if yes, this.Stage = PaymentStage.Paid
    this.currencies = Object.keys(donation_prices["default"]);
    this.prices = donation_prices["default"][this.currency];

    // the below route is triggered when user is redirected back to app from stripe payment 
    this.route.queryParams
      .subscribe(params => {
        this.payment_success = params.payment_success;

        if (this.payment_success === "true") {  // query param payment_success is a string
          this.notifier.notify('success', 'Donation successfully recieved. Thank You!');
        } else if (this.payment_success === "false") {
          this.notifier.notify('error', 'Payment failed');
        }

        if (params && Object.keys(params).length > 0) {
          const urlWithoutQueryParams = this.router.url.substring(0, this.router.url.indexOf('?'));
          this.router.navigateByUrl(urlWithoutQueryParams)
            .then(() => {
            // any other functionality when navigation succeeds
              params = null;
            });
        }
      }
    );

    
    this.auth.user$.subscribe(
      (profile) => {
        this.userId = profile.sub;
      }
    )
    
    var sub = this.auth.user$
        .pipe(
          concatMap((user) =>
            // Use HttpClient to make the call
            this.http.get(
              encodeURI(env.auth.audience + `users/${user.sub}`)
            )
          ),
          pluck('user_metadata'),
          tap((meta) => (this.metadata = meta))
        )
        .subscribe((e) => {
          sub.unsubscribe();
          console.log("user_metadata");
          console.log(this.metadata);

          if (typeof this.metadata !== "undefined") {
            if ((typeof this.metadata.donated !== "undefined" && this.metadata.donated)
            || (typeof this.metadata.skipped_donation !== "undefined" && this.metadata.skipped_donation)) {
              this.Stage = PaymentStage.Paid;
            }
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

  updateUserMetadata(skipped_donation=false){
    console.log("UpdateUserMetadata");
    // Calling PATCH /api/v2/users/{id} along with id_token with scopes create:current_user_metadata update:current_user_metadata 
    
    var usermetadata =  {"donated": true, "skipped_donation": false}  // user donates non-zero amount
    if (skipped_donation) usermetadata = { "donated": false, "skipped_donation": true}

    console.log(`users/${this.userId}`)
    console.log(`${this.metadata}`)
    this.http.patch(
      encodeURI(env.auth.audience + `users/${this.userId}`),
      {"user_metadata": usermetadata}
    ).subscribe()
    
  }

  onZeroPay() {
    this.updateUserMetadata(true);
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
