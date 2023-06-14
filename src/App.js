import './App.css';
import BraintreeDropIn from './components/BraintreeDropIn';
import {useEffect, useState} from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getParameterByName } from './utils'

function App() {
    const [showBraintreeDropIn, setShowBraintreeDropIn] = useState(false);
    const [clientToken, setClientToken] = useState("");
    const [invoice, setInvoice] = useState({});

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const urlParams = new URLSearchParams(window.location.search);
        // url should be encoded with encodeURIComponent as : https%3A%2F%2Fonplus.com.vn%2F%3Famount_currency%3D9.03%26invoice_id%3D648%26merchant_id%3D12%26payment_method%3D0%26timestamp%3D1686737766%26hash_type%3DSHA256%26hash_value%3D79d599abb0bb345aaaf33b5366d07684dae18ce17ea6898013f032eae06d6ce8
        const url = urlParams.get('url');
        setInvoice({
          amount_currency: getParameterByName("amount_currency", url),
          invoice_id: getParameterByName("invoice_id", url),
          merchant_id: getParameterByName("merchant_id", url),
          payment_method: getParameterByName("payment_method", url),
        })
        
        var raw = JSON.stringify({
          "url": url
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
            onPaymentCompleted={() => {
                setShowBraintreeDropIn(false);
            }}
        />
        <ToastContainer pauseOnHover={false} autoClose={2000} hideProgressBar={true} draggable={false} toastClassName={"custom-toaster-class"} />
      </div>
            
    );
}

export default App;
