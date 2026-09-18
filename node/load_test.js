
// load_test.js

// This script uses `axios` for HTTP requests and `p-limit` to control concurrency.
//
// --- First-time setup ---
// 1. Initialize a node project (if you haven't already):
//    npm init -y
//
// 2. Install the required libraries:
//    npm install axios p-limit

import axios from 'axios';
import pLimit from 'p-limit';

// --- Configuration ---
const NUM_REQUESTS = 20;  // Total number of requests to send
const CONCURRENCY = 10;    // Number of requests to send in parallel

// --- Request Details ---
const URL = "http://localhost:5005/run";
const HEADERS = {
  'x-api-key': 'key1',
  'Content-Type': 'application/json; charset=utf-8',
  // Axios will handle the content-length
};
const BODY = {
  event: {
    metadata: {
      contact: {
        additional_attributes: {},
        id: 1477486,
        account_id: 35,
        custom_attributes: {},
        phone_number: "+85256395419",
      },
      attachments: [],
      conversation: {
        id: 9544,
        inbox_id: 525,
        account_id: 35,
        contact_id: 1477486,
      },
    },
    payload: {
      secure: false,
      content_type: "text",
      content: {
        text: "因為啱啱落咗單，但係未見到有任何運輸相關嘅資料",
      },
    },
    low_data_mode: false,
    request_id: "15ff8e46-32a9-4070-8591-b6be436acd1c",
    client: {
      user_id: "85256395419-9544",
      bot_id: "chatwoot-bot-525",
      channel_id: "chatwoot-bot-inbox-525",
    },
    ttl_duration: 1,
  },
  bot_id: "chatwoot-bot-525",
};

const limit = pLimit(CONCURRENCY);

// --- Worker Function ---
async function sendRequest(reqNum) {
  try {
    const response = await axios.post(URL, BODY, { headers: HEADERS, timeout: 30000 });
    // Successful request (status 2xx)
    return { success: true, reqNum };
  } catch (error) {
    // Axios throws an error for non-2xx responses
    let errorDetails = {};
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails = {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails = { message: "No response received from server.", request: error.request };
    } else {
      // Something happened in setting up the request that triggered an Error
      errorDetails = { message: error.message };
    }
    return { success: false, reqNum, error: errorDetails };
  }
}

// --- Main Execution ---
async function main() {
  console.log(`Starting load test with ${NUM_REQUESTS} requests and concurrency limit of ${CONCURRENCY}...`);

  const promises = [];
  for (let i = 1; i <= NUM_REQUESTS; i++) {
    // Wrap the async task in the limiter
    promises.push(limit(() => sendRequest(i)));
  }

  const results = await Promise.all(promises);

  let successful_requests = 0;
  let failed_requests = 0;

  for (const result of results) {
    if (result.success) {
      successful_requests++;
    } else {
      failed_requests++;
      console.log(`\n--- ERROR on Request #${result.reqNum} ---`);
      // Using console.dir for better object inspection
      console.dir(result.error, { depth: null });
      console.log("---------------------------\n");
    }
  }

  console.log("\n--- Load Test Summary ---");
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Successful Requests: ${successful_requests}`);
  console.log(`Failed Requests: ${failed_requests}`);
  console.log("-------------------------\n");

  if (failed_requests > 0) {
    console.log("Review the output above for detailed error messages.");
  }
}

main().catch(console.error);
