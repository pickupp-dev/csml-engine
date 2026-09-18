import concurrent.futures
import requests
import json
import os

# --- Configuration ---
# Adjust these values to control the load test
NUM_REQUESTS = 200  # Total number of requests to send
CONCURRENCY = 50  # Number of requests to send in parallel

# --- Request Details ---
URL = "http://localhost:5005/run"
HEADERS = {"x-api-key": "key1", "Content-Type": "application/json; charset=utf-8"}
BODY = {
    "event": {
        "metadata": {
            "contact": {
                "additional_attributes": {},
                "id": 1477486,
                "account_id": 35,
                "custom_attributes": {},
                "phone_number": "+85256395419",
            },
            "attachments": [],
            "conversation": {
                "id": 9544,
                "inbox_id": 525,
                "account_id": 35,
                "contact_id": 1477486,
            },
        },
        "payload": {
            "secure": False,
            "content_type": "text",
            "content": {"text": "因為啱啱落咗單，但係未見到有任何運輸相關嘅資料"},
        },
        "low_data_mode": False,
        "request_id": "15ff8e46-32a9-4070-8591-b6be436acd1c",
        "client": {
            "user_id": "85256395419-9544",
            "bot_id": "chatwoot-bot-525",
            "channel_id": "chatwoot-bot-inbox-525",
        },
        "ttl_duration": 1,
    },
    "bot_id": "chatwoot-bot-525",
}


# --- Worker Function ---
def send_request(req_num):
    """Sends a single HTTP request and reports its status."""
    try:
        # print(f"Sending request #{req_num}...")
        with requests.Session() as session:
            response = session.post(
                URL,
                headers=HEADERS,
                json=BODY,
                timeout=30,  # 30-second timeout
            )

        if response.status_code == 200:
            # You can comment this out if you only want to see errors
            # print(f"Request #{req_num}: SUCCESS (Status: {response.status_code})")
            return None  # Return None for success
        else:
            error_message = (
                f"Request #{req_num}: FAILED (Status: {response.status_code})"
            )
            try:
                # Try to print JSON response, fall back to raw text
                error_body = response.json()
                error_details = json.dumps(error_body, indent=2, ensure_ascii=False)
            except json.JSONDecodeError:
                error_details = response.text

            full_error = f"{error_message}\nResponse Body:\n{error_details}\n"
            return full_error

    except requests.exceptions.RequestException as e:
        return f"Request #{req_num}: FAILED (Exception: {e})\n"


# --- Main Execution ---
if __name__ == "__main__":
    print(
        f"Starting load test with {NUM_REQUESTS} requests and {CONCURRENCY} concurrent workers..."
    )
    print(f"Starting load test with {NUM_REQUESTS} requests and {CONCURRENCY} concurrent workers...")

    successful_requests = 0
    failed_requests = 0

    # Using ThreadPoolExecutor to send requests concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        # map() runs the function for each item in the range and returns results in order
        results = executor.map(send_request, range(1, NUM_REQUESTS + 1))

        for result in results:
            if result is None:
                successful_requests += 1
            else:
                failed_requests += 1
                # Print the detailed error message for failed requests
                print(result)

    print("\n--- Load Test Summary ---")
    print(f"Total Requests: {NUM_REQUESTS}")
    print(f"Successful Requests: {successful_requests}")
    print(f"Failed Requests: {failed_requests}")
    print("-------------------------\n")

    if failed_requests > 0:
        print("Review the output above for detailed error messages.")
