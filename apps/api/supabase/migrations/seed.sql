
SELECT vault.create_secret('http://localhost:3001/api', 'WEBHOOK_ENDPOINT', 'Webhook endpoint URL');
SELECT vault.create_secret('b0e7b4d4-20da-4821-b187-05d70372aa7f', 'skiller', 'Webhook secret key');