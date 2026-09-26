const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('@mercadopago/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve os arquivos visuais da pasta public (seu index.html)
app.use(express.static('public'));

// Configura o Mercado Pago com a chave que está no arquivo .env
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADO_PAGO_TOKEN 
});
const payment = new Payment(client);

// ROTA QUE GERA O PIX
app.post('/api/criar-pix', async (req, res) => {
    const { email, produto, preco } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório!' });
    }

    try {
        const body = {
            transaction_amount: Number(preco),
            description: `PlanilhasLO - ${produto}`,
            payment_method_id: 'pix',
            payer: {
                email: email
            }
        };

        const resultado = await payment.create({ body });
        
        // Retorna o QR Code e o código "Copia e Cola" para o site
        res.json({
            qr_code: resultado.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (error) {
        console.error('Erro ao gerar o Pix:', error);
        res.status(500).json({ error: 'Erro interno ao processar o pagamento.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor da PlanilhasLO rodando na porta ${PORT}`);
});
