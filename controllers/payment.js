const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
// require("dotenv").config();

exports.chargeAmount = async (req, res) => {
  try {
    const { price, cardDetails } = req.body;
    const { cardNumber, expiry, cvc } = cardDetails;

    if (!price || !cardDetails || !cardNumber || !expiry || !cvc) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const expiryDate = expiry.split("/").join("").trim();
    const card = cardNumber.split(" ").join("").trim();

    const merchantAuthenticationType =
      new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.API_LOGIN_KEY);
    merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(card);
    creditCard.setExpirationDate(expiryDate);
    creditCard.setCardCode(cvc);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );

    const formattedPrice = parseFloat(price).toFixed(2);
    transactionRequestType.setAmount(formattedPrice);

    transactionRequestType.setPayment(paymentType);

    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new ApiControllers.CreateTransactionController(
      createRequest.getJSON()
    );
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      console.log("API Response:", apiResponse);

      if (apiResponse) {
        const response = new ApiContracts.CreateTransactionResponse(
          apiResponse
        );

        if (
          response.getMessages().getResultCode() ===
          ApiContracts.MessageTypeEnum.OK
        ) {
          return res.status(200).json({
            success: true,
            message: "Transaction Successful",
            data: response.getTransactionResponse(),
          });
        } else {
          const errorMessage =
            response
              .getTransactionResponse()
              ?.getErrors()
              ?.getError()[0]
              ?.getErrorText() || "Transaction Failed";
          console.error("Transaction Error:", errorMessage);
          return res
            .status(400)
            .json({ success: false, message: errorMessage });
        }
      } else {
        console.error("API Response is null or undefined.");
        return res
          .status(500)
          .json({ success: false, message: "No response from API." });
      }
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
