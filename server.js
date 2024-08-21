const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/login', async (req, res) => {
    const { url, email, password } = req.body;

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.click("//div[contains(text(), 'Email')]");
        await page.type("input[type='text'][placeholder='Please enter your email address']", email);
        await page.type("input[type='password'][placeholder='Please enter your password']", password);
        await page.click("div.login-btn");

        await page.waitForNavigation();

        if (page.url() !== url) {
            const tradeUrl = "https://2139.online/pc/#/contractTransaction";
            await page.goto(tradeUrl, { waitUntil: 'networkidle2' });

            await page.click("//div[contains(text(), 'invited me')]");
            await page.waitForTimeout(3000);

            try {
                await page.click("//div[contains(text(), ' Confirm to follow the order')]");
                await page.click("//button/span[contains(text(), 'Confirm')]");
                await page.waitForTimeout(50000);
                res.send("Successfully completed the transaction!");
            } catch (e) {
                await page.waitForTimeout(50000);
                res.send("No transaction found or buttons were not available.");
            }
        } else {
            res.send("Login failed or session not maintained properly.");
        }

        await browser.close();
    } catch (e) {
        res.send(`Error: ${e}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
