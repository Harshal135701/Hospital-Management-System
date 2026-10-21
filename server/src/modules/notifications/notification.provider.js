const sendMessage = async ({ channel, recipient, message }) => {
  if (channel !== "sms") {
    throw new Error("Fast2SMS integration currently supports SMS only");
  }

  const apiKey = process.env.FAST2SMS_API_KEY;

  if (
    process.env.ENABLE_REAL_MESSAGING !== "true" ||
    !apiKey
  ) {
    console.log(`[MOCK SMS] To: ${recipient}`);
    console.log(`Message: ${message}`);
    return {
      success: true,
      providerMessageId: `mock-${Date.now()}`,
    };
  }

  const phone = recipient.replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Recipient must be a valid 10-digit Indian mobile number");
  }

  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message,
      language: "english",
      flash: 0,
      numbers: phone,
    }),
  });

  const result = await response.json();

  if (!response.ok || result.return === false) {
    throw new Error(
      `Fast2SMS error: ${JSON.stringify(result)}`
    );
  }

  console.log("Fast2SMS accepted request:", result);

  return {
    success: true,
    providerMessageId: String(
      result.request_id || result.message_id || `fast2sms-${Date.now()}`
    ),
  };
};

module.exports = { sendMessage };
