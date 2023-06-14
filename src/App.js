import './App.css';
import BraintreeDropIn from './components/BraintreeDropIn';
import {useEffect, useState} from "react";

function App() {
    const [showBraintreeDropIn, setShowBraintreeDropIn] = useState(false);
    const [clientToken, setClientToken] = useState("");

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        
        var raw = JSON.stringify({
          "url": "https://onplus.com.vn/?amount_currency=9.03&invoice_id=648&merchant_id=12&payment_method=0&timestamp=1686737766&hash_type=SHA256&hash_value=79d599abb0bb345aaaf33b5366d07684dae18ce17ea6898013f032eae06d6ce8"
        });
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        
        fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/api/v1/publish/generate-braintree-token`, requestOptions)
          .then(response => response.text())
          .then(result => {
            let data = JSON.parse(result)
            setClientToken(data.data)
            setShowBraintreeDropIn(true)
          })
          .catch(error => console.log('error', error));
    }, [])

    return (
            <BraintreeDropIn
                show={showBraintreeDropIn}
                clientToken={clientToken}
                onPaymentCompleted={() => {
                    setShowBraintreeDropIn(false);
                }}
            />
    );
}

export default App;
