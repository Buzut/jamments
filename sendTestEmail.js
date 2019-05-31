const { sendMailWithSMTP } = require('./libs/emailSenders');

sendMailWithSMTP('to', 'subject', 'text');
