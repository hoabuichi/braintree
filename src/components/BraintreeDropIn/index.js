import React, {useEffect, useState} from 'react'
import './index.css';
import dropin from "braintree-web-drop-in"
import { toast } from 'react-toastify';
import CheckoutSuccess from '../checkoutResult';


function BraintreeDropIn(props) {
    const { show, clientToken, invoice } = props;
    const [isPayBtnDisable, setIsPayBtnDisable] = useState(true)
    const [braintreeInstance, setBraintreeInstance] = useState(undefined)
    const [isSuccess, setIsSuccess] = useState(true);
    const [errMsg, setErrMsg] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (show && invoice) {
            const initializeBraintree = () => dropin.create({
                authorization: clientToken, // insert your tokenization key or client token here
                container: '#braintree-drop-in-div',
                paypal: {
                flow: 'checkout',
                amount: invoice.amount_currency, // be sure to validate this amount on your server
                currency: invoice.currency_code ?? 'USD',
                landingPageType: 'login' // hard code this so we get a consistent experience for e2e tests
              },
              paypalCredit: {
                flow: 'checkout',
                amount: invoice.amount_currency,
                currency: invoice.currency_code ?? 'USD',
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
                  currencyCode: invoice.currency_code ?? 'USD',
                  totalPriceStatus: 'FINAL',
                  totalPrice: invoice.amount_currency
                }
              },
              venmo: {
                allowDesktop: true
              },
              vaultManager: true,
            }, function (error, instance) {
                if (error)
                  console.log(error)
                else
                    setBraintreeInstance(instance);
                    instance.on('changeActiveView', function (event) {
                      console.log('change active view', event);
                      if (event.newViewId === 'options') {
                        instance.clearSelectedPaymentMethod();
                      }
                    });
                    instance.on('paymentMethodRequestable', function (event) {
                      setIsPayBtnDisable(false);
                    });
            
                    instance.on('noPaymentMethodRequestable', function (event) {
                      setIsPayBtnDisable(true);
                    });
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
    // eslint-disable-next-line
    }, [show, clientToken])

    return (
        <div
            style={{display: `${show ? "block" : "none"}`}}
        > 
          {isFinished ? <CheckoutSuccess isSuccess={isSuccess} errMsg={errMsg} /> : 
            <>
            <div
                id={"braintree-drop-in-div"}
            />
            <button
                className={isPayBtnDisable ? 'bg-neutral-500 text-white text-base w-full py-2 rounded-md cursor-not-allowed' : 'bg-sky-600 text-white text-base w-full py-2 rounded-md'}
                disabled={isPayBtnDisable}
                onClick={() => {
                    if (braintreeInstance) {
                        braintreeInstance.requestPaymentMethod(
                            (error, payload) => {
                                if (error) {
                                  toast.error(error.message);
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
                                    
                                    fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/api/v1/publish/purchase-braintree/${invoice.invoice_id}`, requestOptions)
                                      .then(response => response.text())
                                      .then(result => {
                                        let data = JSON.parse(result);
                                        if (data.success) {
                                          setIsSuccess(true)
                                          setIsPayBtnDisable(true);
                                        } else {
                                          setIsSuccess(false);
                                          setErrMsg(data.error_message.length > 0 ? data.error_message[0] : "Transation failed")
                                        }
                                        setIsFinished(true);
                                      })
                                      .catch(error => {
                                        console.log(error)
                                      });
                                }
                            });
                    }
                }}
            >
                {
                    "Pay"
                }
            </button>
            </>
          }
        </div>
    )
}

export default BraintreeDropIn
