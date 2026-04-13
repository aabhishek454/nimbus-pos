const twilio = require('twilio');

const sendWhatsAppMessage = async (phone, message, mediaUrl = null) => {
    try {
        const sid = process.env.TWILIO_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        
        if (!sid || !token || !fromNumber) {
            console.warn('WhatsApp skipped: Missing corresponding TWILIO env variables.');
            return;
        }

        const client = twilio(sid, token);

        // Format phone: ensuring it has +91 and no spaces
        let formattedPhone = phone.replace(/\s+/g, '');
        if (!formattedPhone.startsWith('+')) {
            // Strip any leading 0s or local variants just in case
            formattedPhone = `+91${formattedPhone.replace(/^0+/, '')}`;
        }
        if (!formattedPhone.includes('whatsapp:')) {
            formattedPhone = `whatsapp:${formattedPhone}`;
        }

        const payload = {
            from: fromNumber,
            to: formattedPhone,
            body: message
        };

        if (mediaUrl) {
            payload.mediaUrl = [mediaUrl];
        }

        const response = await client.messages.create(payload);
        console.log(`WhatsApp sent successfully to ${formattedPhone}. SID: ${response.sid}`);
        return response;
    } catch (error) {
        console.error('WhatsApp sending failed natively:', error.message);
        // Fail silently so it doesn't crash checkout workflow
    }
};

module.exports = { sendWhatsAppMessage };
