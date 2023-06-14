import React, {useEffect, useState} from 'react'
import './index.css';
import dropin from "braintree-web-drop-in"

function BraintreeDropIn(props) {
    const { show, onPaymentCompleted, clientToken } = props;

    const [braintreeInstance, setBraintreeInstance] = useState(undefined)

    useEffect(() => {
        if (show) {
            const initializeBraintree = () => dropin.create({
                authorization: clientToken, // insert your tokenization key or client token here
                container: '#braintree-drop-in-div',
                paypal: {
                    flow: 'checkout',
                    amount: '10.00', // be sure to validate this amount on your server
                    currency: 'USD',
                    landingPageType: 'login' // hard code this so we get a consistent experience for e2e tests
                  },
                  paypalCredit: {
                    flow: 'checkout',
                    amount: '10.00',
                    currency: 'USD',
                    landingPageType: 'login' // hard code this so we get a consistent experience for e2e tests
                  },
                  applePay: {
                    displayName: 'Braintree Test',
                    paymentRequest: {
                      total: {
                        label: 'Braintree Test Store',
                        amount: '19.99'
                      }
                    }
                  },
                  googlePay: {
                    // merchantId: 'merchant-id', // prod id goes here
                    googlePayVersion: 2,
                    transactionInfo: {
                      currencyCode: 'USD',
                      totalPriceStatus: 'FINAL',
                      totalPrice: '19.99'
                    }
                  },
                  venmo: {
                    allowDesktop: true
                  },
                  vaultManager: true
            }, function (error, instance) {
                if (error)
                    console.error(error)
                else
                    setBraintreeInstance(instance);
            });

            if (braintreeInstance) {
                braintreeInstance
                    .teardown()
                    .then(() => {
                        initializeBraintree();
                    });
            } else {
                initializeBraintree();
            }
        }
    }, [show, clientToken])

    return (
        <div
            style={{display: `${show ? "block" : "none"}`}}
        >
            <div
                id={"braintree-drop-in-div"}
            />

            <button
                className={"braintreePayButton"}
                type="primary"
                disabled={!braintreeInstance}
                onClick={() => {
                    if (braintreeInstance) {
                        braintreeInstance.requestPaymentMethod(
                            (error, payload) => {
                                if (error) {
                                    console.error(error);
                                } else {
                                    var myHeaders = new Headers();
                                    myHeaders.append("Content-Type", "application/json");
                                    
                                    var raw = JSON.stringify({
                                      "payment_method_nonce": payload.nonce,
                                      "buyer_infomations": {
                                        ...payload
                                      }
                                    });
                                    
                                    var requestOptions = {
                                      method: 'PUT',
                                      headers: myHeaders,
                                      body: raw,
                                      redirect: 'follow'
                                    };
                                    
                                    fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/api/v1/publish/purchase-braintree/648`, requestOptions)
                                      .then(response => response.text())
                                      .then(result => console.log(result))
                                      .catch(error => console.log('error', error));
                                    onPaymentCompleted();
                                }
                            });
                    }
                }}
            >
                {
                    "Pay"
                }
            </button>
        </div>
    )
}

export default BraintreeDropIn
