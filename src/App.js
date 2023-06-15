import './App.css';
import BraintreeDropIn from './components/BraintreeDropIn';
import {useEffect, useState} from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [showBraintreeDropIn, setShowBraintreeDropIn] = useState(false);
    const [clientToken, setClientToken] = useState("");
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const urlParams = new URLSearchParams(window.location.search);
        console.log(Object.fromEntries(urlParams))
        // amount_currency=9.03&invoice_id=649&merchant_id=12&payment_method=0&timestamp=1686738314&hash_type=SHA256&hash_value=0fbf62f17331b500ef447e681e63e00b2fee9e39b4529d8836b8eb902f25ffb5
        setInvoice({
          ...Object.fromEntries(urlParams)
        })
        
        var raw = JSON.stringify({
          ...Object.fromEntries(urlParams)
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
            if (data.success) {
              setClientToken(data.data)
              setShowBraintreeDropIn(true)
            } else {
              toast.error(data.error_message.length > 0 ? data.error_message[0] : "Transation failed!")
            }

          })
          .catch(error => console.log('error', error));
    }, [])

    return (
      <div className='container mx-auto pt-40'>
        <BraintreeDropIn
            show={showBraintreeDropIn}
            clientToken={clientToken}
            invoice={invoice}
        />
        <ToastContainer pauseOnHover={false} autoClose={2000} hideProgressBar={true} draggable={false} toastClassName={"custom-toaster-class"} />
      </div>
            
    );
}

export default App;
